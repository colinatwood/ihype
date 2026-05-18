import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profiles = await db.profile.findMany({
    where: { ownerId: session.user.id },
    select: {
      id: true, name: true, slug: true, hypeCount: true,
      profileHypes: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 90 },
      followers: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 90 },
      headlinerShows: {
        where: { startsAt: { gte: new Date() } },
        select: { id: true, title: true, startsAt: true, ticketsSoldCount: true, ticketCapacity: true, ticketPriceCents: true, promoterPayoutPercent: true },
        take: 5, orderBy: { startsAt: 'asc' }
      }
    }
  });

  const result = profiles.map(p => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    // Hype trend: hypes per day for last 7 days
    const hypeTrend = Array.from({ length: 7 }, (_, i) => {
      const start = now - (i + 1) * day;
      const end = now - i * day;
      return { day: i, count: p.profileHypes.filter(h => h.createdAt.getTime() >= start && h.createdAt.getTime() < end).length };
    }).reverse();
    // Follower growth: new followers last 30 days
    const followerGrowth = p.followers.filter(f => f.createdAt.getTime() > now - 30 * day).length;
    return { id: p.id, name: p.name, slug: p.slug, hypeCount: p.hypeCount, hypeTrend, followerGrowth, upcomingShows: p.headlinerShows };
  });

  return NextResponse.json({ profiles: result });
}
