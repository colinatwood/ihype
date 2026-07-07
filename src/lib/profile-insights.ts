import { db } from '@/lib/db';
import { bucketHypePosition, computeShowDurationSecs } from '@/lib/hype-position';

export type CityBreakdown = { city: string; count: number };

export type ProfileInsights = {
  hypeTotal: number;
  followerCount: number;
  bookingRequests: { pending: number; accepted: number; declined: number };
  /** Only present for ARTIST/DJ/VENUE — LISTENER profiles have no shows/media of their own. */
  listeners?: { distinctListeners: number; totalPlays: number };
  topTracks?: { title: string; plays: number }[];
  hypePositions?: { early: number; mid: number; late: number; untracked: number };
  topCities?: CityBreakdown[];
  ticketRevenueCents?: number;
  ticketsSold?: number;
};

const TOP_CITIES_LIMIT = 5;
const TOP_TRACKS_LIMIT = 5;

function topByCount<T extends string>(counts: Record<T, number>, limit: number): { key: T; count: number }[] {
  return Object.entries(counts)
    .map(([key, count]) => ({ key: key as T, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function getBookingRequestCounts(profileId: string) {
  const rows = await db.bookingRequest.groupBy({
    by: ['status'],
    where: { toProfileId: profileId },
    _count: { _all: true },
  });
  const counts = { pending: 0, accepted: 0, declined: 0 };
  for (const row of rows) {
    if (row.status === 'pending' || row.status === 'accepted' || row.status === 'declined') {
      counts[row.status] = row._count._all;
    }
  }
  return counts;
}

async function getListenerStats(profileId: string) {
  const assets = await db.artistMediaAsset.findMany({
    where: { profileId },
    select: { hexId: true, title: true },
  });
  if (assets.length === 0) return { listeners: { distinctListeners: 0, totalPlays: 0 }, topTracks: [] };

  const hexIds = assets.map((a) => a.hexId);
  // MediaListen is unique per (userId, mediaId) — it records "has listened at
  // least once," not repeat plays — so grouping by mediaId gives per-track
  // listener counts, and a distinct userId count gives the overall reach.
  const [playCounts, distinctListeners] = await Promise.all([
    db.mediaListen.groupBy({ by: ['mediaId'], where: { mediaId: { in: hexIds } }, _count: { _all: true } }),
    db.mediaListen.findMany({ where: { mediaId: { in: hexIds } }, select: { userId: true }, distinct: ['userId'] }),
  ]);

  const titleByHexId = new Map(assets.map((a) => [a.hexId, a.title]));
  const topTracks = playCounts
    .map((r) => ({ title: titleByHexId.get(r.mediaId) ?? 'Untitled', plays: r._count._all }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, TOP_TRACKS_LIMIT);
  const totalPlays = playCounts.reduce((sum, r) => sum + r._count._all, 0);

  return {
    listeners: { distinctListeners: distinctListeners.length, totalPlays },
    topTracks,
  };
}

type ShowWhere =
  | { OR: ({ headlinerProfileId: string } | { promoterProfileId: string })[] }
  | { venueProfileId: string };

async function getShowBasedStats(showWhere: ShowWhere) {
  const shows = await db.show.findMany({
    where: showWhere,
    select: {
      id: true,
      productionPlan: true,
      radioTracks: { select: { durationSecs: true } },
      hypes: { select: { positionSeconds: true } },
      ticketOrders: { where: { status: 'CAPTURED' }, select: { locationCity: true, totalChargeCents: true, quantity: true } },
    },
  });

  const hypePositions = { early: 0, mid: 0, late: 0, untracked: 0 };
  const cityCounts: Record<string, number> = {};
  let ticketRevenueCents = 0;
  let ticketsSold = 0;

  for (const show of shows) {
    const durationSecs = computeShowDurationSecs(show);
    for (const hype of show.hypes) {
      if (hype.positionSeconds == null) { hypePositions.untracked += 1; continue; }
      const bucket = bucketHypePosition(hype.positionSeconds, durationSecs);
      if (bucket) hypePositions[bucket] += 1;
      else hypePositions.untracked += 1;
    }
    for (const order of show.ticketOrders) {
      ticketRevenueCents += order.totalChargeCents;
      ticketsSold += order.quantity;
      if (order.locationCity) {
        cityCounts[order.locationCity] = (cityCounts[order.locationCity] ?? 0) + order.quantity;
      }
    }
  }

  const topCities = topByCount(cityCounts, TOP_CITIES_LIMIT).map((c) => ({ city: c.key, count: c.count }));

  return { hypePositions, topCities, ticketRevenueCents, ticketsSold };
}

/** Owner-only aggregate stats for an Artist/DJ/Venue page — never fabricated, only real DB aggregates. */
export async function getProfileInsights(profileId: string, profileType: string): Promise<ProfileInsights> {
  const [profile, bookingRequests] = await Promise.all([
    db.profile.findUnique({
      where: { id: profileId },
      select: { hypeCount: true, _count: { select: { followers: true } } },
    }),
    getBookingRequestCounts(profileId),
  ]);

  const base: ProfileInsights = {
    hypeTotal: profile?.hypeCount ?? 0,
    followerCount: profile?._count.followers ?? 0,
    bookingRequests,
  };

  if (profileType === 'ARTIST' || profileType === 'DJ') {
    // DJ profiles' own shows are typically attached via promoterProfileId
    // (see src/app/promoters/[slug]/page.tsx), not headlinerProfileId like a
    // plain artist — check both so a DJ's hosted shows aren't silently missed.
    const [{ listeners, topTracks }, showStats] = await Promise.all([
      getListenerStats(profileId),
      getShowBasedStats({ OR: [{ headlinerProfileId: profileId }, { promoterProfileId: profileId }] }),
    ]);
    return {
      ...base,
      listeners,
      topTracks,
      hypePositions: showStats.hypePositions,
      topCities: showStats.topCities,
    };
  }

  if (profileType === 'VENUE') {
    const showStats = await getShowBasedStats({ venueProfileId: profileId });
    return {
      ...base,
      hypePositions: showStats.hypePositions,
      topCities: showStats.topCities,
      ticketRevenueCents: showStats.ticketRevenueCents,
      ticketsSold: showStats.ticketsSold,
    };
  }

  return base;
}
