import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/artist-media/free-use
 *
 * Returns all tracks that artists have opted into the iHYPE Free Use Policy.
 * These tracks may be streamed by fans and curated into radio shows by promoters/DJs.
 * Downloading is not permitted — the media route only serves inline (not as attachment).
 *
 * Query params:
 *   q       - search by title or artist name (case-insensitive)
 *   limit   - max results (default 100, max 200)
 *   offset  - pagination offset (default 0)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const limitParam = parseInt(searchParams.get('limit') ?? '100', 10);
  const limit = Math.min(Math.max(1, isNaN(limitParam) ? 100 : limitParam), 200);
  const offsetParam = parseInt(searchParams.get('offset') ?? '0', 10);
  const offset = Math.max(0, isNaN(offsetParam) ? 0 : offsetParam);

  const where = q
    ? {
        freeUseEnabled: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { profile: { name: { contains: q, mode: 'insensitive' as const } } }
        ]
      }
    : { freeUseEnabled: true };

  const [tracks, total] = await Promise.all([
    db.artistMediaAsset.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      skip: offset,
      select: {
        hexId: true,
        title: true,
        notes: true,
        mimeType: true,
        fileSizeBytes: true,
        createdAt: true,
        profile: {
          select: {
            slug: true,
            name: true,
            avatarImage: true,
            genres: true,
            city: true,
            stateRegion: true
          }
        }
      }
    }),
    db.artistMediaAsset.count({ where })
  ]);

  const payload = tracks.map(t => ({
    hexId: t.hexId,
    title: t.title,
    notes: t.notes,
    mimeType: t.mimeType,
    fileSizeBytes: t.fileSizeBytes,
    streamUrl: `/api/media/${t.hexId}`,
    createdAt: t.createdAt,
    artist: {
      name: t.profile.name,
      slug: t.profile.slug,
      avatarImage: t.profile.avatarImage,
      genres: t.profile.genres,
      location: [t.profile.city, t.profile.stateRegion].filter(Boolean).join(', ')
    }
  }));

  return NextResponse.json({ tracks: payload, total, limit, offset });
}
