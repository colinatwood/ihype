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

  // Fetch all listens for daily grouping
  const allListens = await db.mediaListen.findMany({
    where: { mediaId: { in: mediaIds }, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });

  // Build 30-day array (index 0 = 30 days ago, index 29 = today)
  const dailyCounts = new Array(30).fill(0);
  const now = Date.now();
  for (const l of allListens) {
    const daysAgo = Math.floor((now - l.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const idx = 29 - daysAgo;
    if (idx >= 0 && idx < 30) dailyCounts[idx]++;
  }

  return NextResponse.json({ listens30d: total, finishRate, topTracks, dailyListens: dailyCounts });
}
