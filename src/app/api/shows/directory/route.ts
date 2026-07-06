import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getShowsDirectoryData } from '@/lib/public-data';
import { sortShowsForFeed } from '@/lib/integrity';
import { detectRequestLocation } from '@/lib/request-location';
import { getShowRecommendations } from '@/lib/show-recommendations';
import { enhanceShowRecommendationsWithAI } from '@/lib/ai-show-recommendations';

export const dynamic = 'force-dynamic';

function serializeShow<T extends { startsAt: Date | string }>(show: T) {
  return { ...show, startsAt: show.startsAt instanceof Date ? show.startsAt.toISOString() : show.startsAt };
}

/**
 * Powers the mobile Events home (EventsHome.tsx): the full upcoming-shows
 * feed plus enough personalization signal (nearest city, hyped genres) for
 * the client to compute the Local slice itself — mirrors exactly what
 * src/app/shows/page.tsx computes server-side for the desktop route. For
 * You is now computed here directly: a real multi-signal recommender
 * (show-recommendations.ts, reusing the same taste/geo/collaborative scoring
 * already unit-tested for the artist/venue recommender) over listening
 * history (hypes + Seed swipes), event/ticket-purchase history, and
 * location, with an AI re-rank + "why" pass on top (ai-show-recommendations.ts).
 */
export async function GET() {
  const [rawShows, viewerLocation, session] = await Promise.all([
    getShowsDirectoryData(),
    detectRequestLocation(),
    auth().catch(() => null),
  ]);

  let userCity: string | null = null;
  let userGenres: string[] = [];
  if (session?.user?.id) {
    const [userProfile, hypedGenres] = await Promise.all([
      db.profile.findFirst({ where: { ownerId: session.user.id }, select: { city: true }, orderBy: { createdAt: 'asc' } }).catch(() => null),
      db.profileHypeEvent.findMany({ where: { userId: session.user.id }, select: { profile: { select: { genres: true } } }, take: 50 }).catch(() => []),
    ]);
    userCity = userProfile?.city ?? null;
    userGenres = Array.from(new Set(hypedGenres.flatMap((h) => h.profile.genres)));
  }
  const nearCity = userCity ?? viewerLocation?.city ?? null;

  const now = new Date();
  // startsAt may already be a plain string here (unstable_cache round-trips
  // through JSON), so re-wrap rather than compare it to `now` directly.
  const upcoming = sortShowsForFeed(rawShows)
    .filter((show) => show.status !== 'ENDED' && show.status !== 'CANCELED' && new Date(show.startsAt) >= now);

  let forYouShows = upcoming;
  let aiEnhanced = false;
  try {
    const rec = await getShowRecommendations(session?.user?.id ?? null, viewerLocation, upcoming);
    const enhanced = await enhanceShowRecommendationsWithAI(rec.shows, {
      genres: rec.meta.viewerGenres,
      city: nearCity,
      stateRegion: viewerLocation?.stateRegion ?? null,
      hasHistory: rec.meta.viewerHasHistory,
      recentArtists: rec.meta.recentArtistNames,
    });
    forYouShows = enhanced.shows;
    aiEnhanced = enhanced.aiEnhanced;
  } catch (error) {
    console.error('[api/shows/directory] For You recommendation error, falling back to deterministic order', error);
  }

  return NextResponse.json(
    {
      shows: upcoming.map(serializeShow),
      forYouShows: forYouShows.map(serializeShow),
      aiEnhanced,
      nearCity,
      userGenres,
      loggedIn: !!session?.user?.id,
    },
    { headers: { 'Cache-Control': 'private, max-age=0, must-revalidate' } }
  );
}
