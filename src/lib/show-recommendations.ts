import { db } from '@/lib/db';
import type { RequestLocation } from '@/lib/request-location';
import type { PublicShow } from '@/lib/public-data';
import {
  geoTier, tasteScore, finalScore, historyBoost, buildReason,
  type Signals, type RecommendationReason,
} from '@/lib/recommendation-scoring';

const SEED_WEIGHTS = { hype: 1.0, save: 0.6, skip: -0.4 } as const;

export type RecommendedShow = PublicShow & {
  reason: RecommendationReason;
  _scores: Record<string, number | null>;
};

export type ShowRecommendationMeta = {
  viewerHasGenres: boolean;
  viewerHasHistory: boolean;
  viewerGenres: string[];
  recentArtistNames: string[];
};

export type ShowRecommendationResult = {
  shows: RecommendedShow[];
  meta: ShowRecommendationMeta;
};

/**
 * Personalizes the upcoming-shows list for "For You": scores every candidate
 * show by taste (headliner genre overlap with artists the viewer has hyped
 * or swiped-save'd), geo (does the venue sit near the viewer), momentum
 * (ticket sell-through), collaborative filtering (do fans of the viewer's
 * artists also turn out for this headliner), and a repeat-affinity boost
 * from actual ticket-purchase history — reuses the same pure scoring
 * functions the artist/venue recommender (recommendations.ts) already has
 * unit tests for. Shows the viewer already holds a ticket to are excluded.
 */
export async function getShowRecommendations(
  viewerId: string | null,
  requestLocation: RequestLocation | null,
  candidates: PublicShow[],
): Promise<ShowRecommendationResult> {
  let viewerState: string | null = requestLocation?.stateRegion ?? null;
  let viewerCountry: string | null = requestLocation?.country ?? null;
  const viewerCity: string | null = requestLocation?.city ?? null;
  let viewerGenres: string[] = [];
  let recentArtistNames: string[] = [];
  const seenArtistIds = new Set<string>();
  const seenVenueIds = new Set<string>();
  const alreadyTicketedShowIds = new Set<string>();
  const collabScores = new Map<string, number>();
  const seedSignals = new Map<string, number>();
  const genreToArtist = new Map<string, { name: string; slug: string }>();

  if (viewerId) {
    const [hypedProfiles, seedRows, pastOrders] = await Promise.all([
      db.profileHypeEvent.findMany({
        where: { userId: viewerId },
        orderBy: { createdAt: 'desc' },
        select: { profileId: true, profile: { select: { name: true, slug: true, genres: true, stateRegion: true, country: true } } },
      }),
      db.seed.findMany({
        where: { userId: viewerId },
        select: { mediaId: true, action: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      db.ticketOrder.findMany({
        where: { buyerUserId: viewerId, status: { in: ['CAPTURED', 'RESERVED'] } },
        select: { showId: true, show: { select: { headlinerProfileId: true, venueProfileId: true } } },
      }),
    ]);

    const hypedGenreCounts = new Map<string, number>();
    for (const { profile } of hypedProfiles) {
      if (!profile) continue;
      viewerState ??= profile.stateRegion;
      viewerCountry ??= profile.country;
      for (const genre of profile.genres) {
        const key = genre.toLowerCase();
        hypedGenreCounts.set(key, (hypedGenreCounts.get(key) ?? 0) + 1);
        if (!genreToArtist.has(key)) genreToArtist.set(key, { name: profile.name, slug: profile.slug });
      }
    }
    viewerGenres = [...hypedGenreCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([g]) => g);
    recentArtistNames = [...new Set(hypedProfiles.map((h) => h.profile?.name).filter((n): n is string => Boolean(n)))].slice(0, 8);

    const hypedArtistIds = new Set(hypedProfiles.map((h) => h.profileId));

    for (const order of pastOrders) {
      alreadyTicketedShowIds.add(order.showId);
      if (order.show?.headlinerProfileId) seenArtistIds.add(order.show.headlinerProfileId);
      if (order.show?.venueProfileId) seenVenueIds.add(order.show.venueProfileId);
    }

    if (seedRows.length > 0) {
      const mediaIds = [...new Set(seedRows.map((s) => s.mediaId))];
      const assets = await db.artistMediaAsset.findMany({ where: { id: { in: mediaIds } }, select: { id: true, profileId: true } });
      const mediaToProfile = new Map(assets.map((a) => [a.id, a.profileId]));
      for (const { mediaId, action } of seedRows) {
        const profileId = mediaToProfile.get(mediaId);
        if (!profileId) continue;
        const weight = SEED_WEIGHTS[action as keyof typeof SEED_WEIGHTS] ?? 0;
        seedSignals.set(profileId, (seedSignals.get(profileId) ?? 0) + weight);
      }
      const maxSeed = Math.max(...seedSignals.values(), 1);
      for (const [id, score] of seedSignals) seedSignals.set(id, score / maxSeed);
    }

    if (hypedArtistIds.size > 0) {
      // Co-hype: other fans who hyped the same artists the viewer hyped — what
      // else (among our candidate shows' headliners) do those fans also hype.
      const coHypeUsers = await db.profileHypeEvent.findMany({
        where: { profileId: { in: [...hypedArtistIds] }, userId: { not: viewerId } },
        select: { userId: true },
        distinct: ['userId'],
        take: 300,
      });
      if (coHypeUsers.length > 0) {
        const coHypeUserIds = coHypeUsers.map((u) => u.userId);
        const coHypeEvents = await db.profileHypeEvent.groupBy({
          by: ['profileId'],
          where: { userId: { in: coHypeUserIds } },
          _count: { _all: true },
          orderBy: { _count: { profileId: 'desc' } },
          take: 200,
        });
        const maxCoHype = coHypeEvents[0]?._count._all ?? 1;
        for (const { profileId, _count } of coHypeEvents) {
          collabScores.set(profileId, _count._all / maxCoHype);
        }
      }
    }
  }

  const eligible = candidates.filter((s) => !alreadyTicketedShowIds.has(s.id));
  if (eligible.length === 0) {
    return { shows: [], meta: { viewerHasGenres: viewerGenres.length > 0, viewerHasHistory: seenArtistIds.size > 0, viewerGenres, recentArtistNames } };
  }

  const maxHype = Math.max(...eligible.map((s) => s.hypeCount), 1);
  const fillRates = eligible.map((s) => (s.ticketCapacity && s.ticketCapacity > 0 ? Math.min(1, s.ticketsSoldCount / s.ticketCapacity) : 0));
  const maxFill = Math.max(...fillRates, 1);

  const scored: RecommendedShow[] = eligible.map((show, index) => {
    const headliner = show.headlinerProfile;
    const venue = show.venueProfile;

    const taste = headliner ? tasteScore(viewerGenres, headliner.genres) : null;
    const geo = venue ? geoTier(viewerState, viewerCountry, viewerCity, venue.stateRegion, venue.country, venue.city) : null;
    const social = Math.log1p(show.hypeCount) / Math.log1p(maxHype);
    const momentum = fillRates[index] / maxFill;
    const headlinerId = headliner?.id;
    const collab = headlinerId ? collabScores.get(headlinerId) ?? null : null;

    const signals: Signals = { taste, geo, social, momentum, collab, comparable: null };
    const base = finalScore(signals);

    const seedBoost = headlinerId ? seedSignals.get(headlinerId) ?? 0 : 0;
    const venueId = venue?.id;
    const seenArtistBefore = Boolean(headlinerId && seenArtistIds.has(headlinerId));
    const seenVenueBefore = Boolean(venueId && seenVenueIds.has(venueId));
    const factor = (1 + seedBoost * 0.4) * historyBoost(seenArtistBefore, seenVenueBefore);

    const reason = buildReason(signals, headliner?.genres ?? [], genreToArtist, venue?.city ?? null);

    return {
      ...show,
      reason,
      _scores: { ...signals, seed: seedBoost, seenArtistBefore: seenArtistBefore ? 1 : 0, seenVenueBefore: seenVenueBefore ? 1 : 0, final: Math.max(0, base * factor) },
    };
  });

  scored.sort((a, b) => (b._scores.final ?? 0) - (a._scores.final ?? 0));

  return {
    shows: scored,
    meta: { viewerHasGenres: viewerGenres.length > 0, viewerHasHistory: seenArtistIds.size > 0 || viewerGenres.length > 0, viewerGenres, recentArtistNames },
  };
}
