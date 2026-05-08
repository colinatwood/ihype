import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoCreatorExclusion, getDemoOwnerExclusion } from '@/lib/runtime-flags';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const typeFilter = searchParams.get('type') ?? 'all';
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '20', 10);
  const limit = Math.min(Math.max(1, Number.isNaN(limitParam) ? 20 : limitParam), 60);
  const demoOwnerExclusion = getDemoOwnerExclusion();
  const profileRelationExclusion = Object.keys(demoOwnerExclusion).length
    ? { profile: demoOwnerExclusion }
    : {};

  if (!q) {
    return NextResponse.json({ results: [], genres: [] });
  }

  const includeProfiles = typeFilter === 'all' || typeFilter === 'artist';
  const includeSongs = typeFilter === 'all' || typeFilter === 'song';
  const includeShows = typeFilter === 'all' || typeFilter === 'show';

  const [profiles, tracks, shows] = await Promise.all([
    includeProfiles
      ? db.profile.findMany({
          where: {
            type: { in: ['ARTIST', 'DJ', 'VENUE'] },
            ...demoOwnerExclusion,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { headline: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
              { stateRegion: { contains: q, mode: 'insensitive' } },
              { hometown: { contains: q, mode: 'insensitive' } }
            ]
          },
          orderBy: [{ hypeCount: 'desc' }],
          take: limit,
          select: {
            id: true,
            slug: true,
            type: true,
            name: true,
            headline: true,
            city: true,
            stateRegion: true,
            country: true,
            genres: true,
            hypeCount: true,
            avatarImage: true,
            verified: true
          }
        })
      : Promise.resolve([]),

    includeSongs
      ? db.artistMediaAsset.findMany({
          where: {
            freeUseEnabled: true,
            ...profileRelationExclusion,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { notes: { contains: q, mode: 'insensitive' } },
              { profile: { name: { contains: q, mode: 'insensitive' } } },
              { profile: { genres: { hasSome: [q.toLowerCase()] } } }
            ]
          },
          orderBy: [{ createdAt: 'desc' }],
          take: limit,
          select: {
            hexId: true,
            title: true,
            mimeType: true,
            notes: true,
            createdAt: true,
            profile: { select: { name: true, slug: true, genres: true } }
          }
        })
      : Promise.resolve([]),

    includeShows
      ? db.show.findMany({
          where: {
            status: { in: ['SCHEDULED', 'LIVE'] },
            ...getDemoCreatorExclusion(),
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          },
          orderBy: [{ startsAt: 'asc' }],
          take: limit,
          select: {
            id: true,
            title: true,
            status: true,
            startsAt: true,
            isRadioShow: true,
            tags: true,
            isTicketed: true,
            venueProfile: { select: { name: true, slug: true, city: true } },
            headlinerProfile: { select: { name: true, slug: true } }
          }
        })
      : Promise.resolve([])
  ]);

  const genreMatches = new Set<string>();
  profiles.forEach((profile) => {
    profile.genres.forEach((genre) => {
      if (genre.toLowerCase().includes(q.toLowerCase())) {
        genreMatches.add(genre);
      }
    });
  });

  type ResultItem = {
    type: 'artist' | 'venue' | 'promoter' | 'song' | 'show' | 'genre';
    id: string;
    name: string;
    subtitle: string;
    slug?: string;
    hypeCount?: number;
    status?: string;
    isRadioShow?: boolean;
    genres?: string[];
  };

  const results: ResultItem[] = [];

  profiles.forEach((profile) => {
    const location = [profile.city, profile.stateRegion].filter(Boolean).join(', ');
    const type = profile.type === 'VENUE' ? 'venue' : profile.type === 'DJ' ? 'promoter' : 'artist';
    const subtitle = [
      profile.genres.slice(0, 2).join(' / '),
      location,
      profile.hypeCount ? `${profile.hypeCount} HYPE` : null
    ]
      .filter(Boolean)
      .join(' / ');

    results.push({
      type,
      id: profile.id,
      name: profile.name,
      subtitle,
      slug: profile.slug,
      hypeCount: profile.hypeCount ?? 0,
      genres: profile.genres
    });
  });

  tracks.forEach((track) => {
    const subtitle =
      `by ${track.profile.name}` +
      (track.profile.genres.length ? ` / ${track.profile.genres.slice(0, 2).join(', ')}` : '');

    results.push({
      type: 'song',
      id: track.hexId,
      name: track.title,
      subtitle,
      slug: track.profile.slug
    });
  });

  shows.forEach((show) => {
    const date = show.startsAt
      ? new Date(show.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'TBD';
    const subtitle = [
      show.isRadioShow ? 'Radio show' : show.venueProfile?.name ?? null,
      date,
      show.isTicketed ? 'Ticketed' : null
    ]
      .filter(Boolean)
      .join(' / ');

    results.push({
      type: 'show',
      id: show.id,
      name: show.title,
      subtitle,
      status: show.status,
      isRadioShow: show.isRadioShow ?? false
    });
  });

  genreMatches.forEach((genre) => {
    results.push({
      type: 'genre',
      id: `genre-${genre}`,
      name: genre,
      subtitle: 'Browse by genre'
    });
  });

  return NextResponse.json({
    results,
    genres: Array.from(genreMatches),
    counts: {
      artists: profiles.filter((profile) => profile.type !== 'VENUE').length,
      venues: profiles.filter((profile) => profile.type === 'VENUE').length,
      songs: tracks.length,
      shows: shows.length,
      genres: genreMatches.size
    }
  });
}
