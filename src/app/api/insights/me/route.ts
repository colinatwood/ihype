import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const profile = await db.profile.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, slug: true },
  });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get this profile's media asset IDs for join
  const mediaAssets = await db.artistMediaAsset.findMany({
    where: { profileId: profile.id },
    select: { id: true, title: true },
  });
  const mediaIds = mediaAssets.map(m => m.id);

  const [total, finished, perTrack] = await Promise.all([
    db.mediaListen.count({
      where: { mediaId: { in: mediaIds }, createdAt: { gte: thirtyDaysAgo } },
    }),
    db.mediaListen.count({
      where: { mediaId: { in: mediaIds }, createdAt: { gte: thirtyDaysAgo }, completedAt: { not: null } },
    }),
    db.mediaListen.groupBy({
      by: ['mediaId'],
      _count: { id: true },
      where: { mediaId: { in: mediaIds }, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  const topTracks = perTrack.map(row => {
    const asset = mediaAssets.find(a => a.id === row.mediaId);
    return { title: asset?.title ?? 'Unknown', listens: row._count.id };
  });

  const finishRate = total > 0 ? Math.round((finished / total) * 100) : 0;

  return NextResponse.json({ listens30d: total, finishRate, topTracks });
}
