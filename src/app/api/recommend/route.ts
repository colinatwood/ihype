import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ProfileType } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recommend?role=FAN|ARTIST|DJ|VENUE&type=ARTIST|DJ|VENUE&limit=40
 *
 * Returns profiles with real signal scores for the why-panel.
 * Signals:
 *   social   — log-normalized hypeCount against result-set max (always real)
 *   momentum — hypeCount / profile age in days, normalized (always real)
 *   geo      — tier based on viewer's profile location vs artist location (real if viewer has location)
 *   taste    — genre overlap between viewer's genres and artist's genres (real if viewer has genres)
 *   final    — weighted average of available signals (null signals excluded from weight denominator)
 *
 * Weights: taste=0.40  geo=0.25  social=0.20  momentum=0.15
 */

const WEIGHTS = { taste: 0.40, geo: 0.25, social: 0.20, momentum: 0.15 };

const VALID_TYPES: ProfileType[] = ['ARTIST', 'DJ', 'VENUE'];

function geoTier(viewerState: string | null, viewerCountry: string | null,
                  profileState: string | null, profileCountry: string | null): number | null {
  if (!viewerState && !viewerCountry) return null;
  if (!profileState && !profileCountry) return null;

  if (viewerState && profileState && viewerState.toLowerCase() === profileState.toLowerCase()) return 1.0; // local
  if (viewerCountry && profileCountry && viewerCountry.toLowerCase() === profileCountry.toLowerCase()) return 0.55; // national
  return 0.20; // global
}

function tasteScore(viewerGenres: string[], profileGenres: string[]): number | null {
  if (!viewerGenres.length) return null;
  if (!profileGenres.length) return 0;
  const vSet = new Set(viewerGenres.map(g => g.toLowerCase()));
  const overlap = profileGenres.filter(g => vSet.has(g.toLowerCase())).length;
  return Math.min(1, overlap / Math.max(1, viewerGenres.length));
}

function finalScore(signals: { taste: number | null; geo: number | null; social: number; momentum: number }): number {
  let weightedSum = 0;
  let totalWeight = 0;

  const entries: [keyof typeof WEIGHTS, number | null][] = [
    ['taste',    signals.taste],
    ['geo',      signals.geo],
    ['social',   signals.social],
    ['momentum', signals.momentum],
  ];

  for (const [key, val] of entries) {
    if (val !== null) {
      weightedSum += val * WEIGHTS[key];
      totalWeight  += WEIGHTS[key];
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

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
    return NextResponse.json({ profiles: [], meta: { viewerHasLocation: false, viewerHasGenres: false } });
  }

  // ── Compute score signals ─────────────────────────────────────────
  const maxHype = Math.max(...profiles.map(p => p.hypeCount), 1);
  const now     = Date.now();

  // Max momentum (for normalization)
  const momentumRaw = profiles.map(p => {
    const ageMs   = Math.max(1, now - new Date(p.createdAt).getTime());
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return (p.hypeCount + 1) / (ageDays + 1);
  });
  const maxMomentum = Math.max(...momentumRaw, 1);

  const scored = profiles.map((p, i) => {
    // Social: log-normalized hypeCount [0, 1]
    const social = maxHype > 0
      ? Math.log1p(p.hypeCount) / Math.log1p(maxHype)
      : 0;

    // Momentum: hype velocity (per day), normalized [0, 1]
    const momentum = momentumRaw[i] / maxMomentum;

    // Geo: real tier if viewer has location
    const geo = geoTier(viewerState, viewerCountry, p.stateRegion, p.country);

    // Taste: genre overlap if viewer has genres
    const taste = tasteScore(viewerGenres, p.genres);

    const signals = { social, momentum, geo, taste };
    const final   = finalScore(signals);

    return {
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
      _scores: { ...signals, final },
      _rank: i,
    };
  });

  // Re-sort by final score so the order reflects real signals
  scored.sort((a, b) => b._scores.final - a._scores.final);
  scored.forEach((p, i) => { p._rank = i; });

  return NextResponse.json({
    profiles: scored,
    meta: {
      viewerHasLocation: !!(viewerState || viewerCountry),
      viewerHasGenres:   viewerGenres.length > 0,
      weights: WEIGHTS,
    },
  });
}
