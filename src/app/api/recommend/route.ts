import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ProfileType } from '@prisma/client';
import { RECOMMEND_WEIGHTS, scoreProfiles } from '@/lib/recommend';

export const dynamic = 'force-dynamic';

const VALID_TYPES: ProfileType[] = ['ARTIST', 'DJ', 'VENUE'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam  = searchParams.get('type')?.toUpperCase() as ProfileType | null;
  const limitParam = parseInt(searchParams.get('limit') ?? '40', 10);
  const limit      = Math.min(Math.max(1, isNaN(limitParam) ? 40 : limitParam), 100);

  // ── Viewer context (optional — graceful fallback for signed-out) ──
  let viewerState:   string | null = null;
  let viewerCountry: string | null = null;
  let viewerGenres:  string[]      = [];

  try {
    const session = await auth();
    if (session?.user?.id) {
      const viewerProfile = await db.profile.findFirst({
        where: { ownerId: session.user.id },
        select: { stateRegion: true, country: true, genres: true },
      });
      if (viewerProfile) {
        viewerState   = viewerProfile.stateRegion;
        viewerCountry = viewerProfile.country;
        viewerGenres  = viewerProfile.genres;
      }
    }
  } catch { /* no session — anonymous viewer */ }

  // ── Fetch profiles ────────────────────────────────────────────────
  const typeFilter = typeParam && VALID_TYPES.includes(typeParam)
    ? { type: typeParam }
    : { type: { in: VALID_TYPES } };

  const profiles = await db.profile.findMany({
    where: typeFilter,
    orderBy: [{ hypeCount: 'desc' }, { verified: 'desc' }, { name: 'asc' }],
    take: limit,
    select: {
      id: true, slug: true, hexId: true, type: true,
      name: true, headline: true, bio: true,
      city: true, stateRegion: true, country: true,
      genres: true, hypeCount: true, verified: true,
      avatarImage: true, createdAt: true,
    },
  });

  if (!profiles.length) {
    return NextResponse.json({ profiles: [], meta: { viewerHasLocation: false, viewerHasGenres: false, weights: RECOMMEND_WEIGHTS } });
  }

  const viewer = { genres: viewerGenres, stateRegion: viewerState, country: viewerCountry };
  const scored = scoreProfiles(profiles, viewer)
    .map((p, i) => ({
      id: p.id,
      slug: p.slug,
      hexId: p.hexId,
      type: p.type,
      name: p.name,
      headline: p.headline,
      city: p.city,
      stateRegion: p.stateRegion,
      country: p.country,
      genres: p.genres,
      hypeCount: p.hypeCount,
      verified: p.verified,
      avatarImage: p.avatarImage,
      _scores: p._scores,
      _rank: i,
    }));

  scored.sort((a, b) => b._scores.final - a._scores.final);
  scored.forEach((p, i) => { p._rank = i; });

  return NextResponse.json({
    profiles: scored,
    meta: {
      viewerHasLocation: !!(viewerState || viewerCountry),
      viewerHasGenres:   viewerGenres.length > 0,
      weights: RECOMMEND_WEIGHTS,
    },
  });
}
