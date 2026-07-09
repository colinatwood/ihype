import { NextRequest, NextResponse } from 'next/server';
import { isCronRequestAuthorized } from '@/lib/cron-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/show-lifecycle
 * Cron — runs every minute.
 * Transitions shows between SCHEDULED → LIVE → ENDED based on startsAt/endsAt.
 * Guarded by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const openEndedCutoff = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const [toLive, toEnded, staleEnded] = await Promise.all([
    // SCHEDULED → LIVE: startsAt has passed and no endsAt or endsAt is in the future
    db.show.updateMany({
      where: {
        status: 'SCHEDULED',
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }]
      },
      data: { status: 'LIVE' }
    }),
    // LIVE → ENDED: endsAt has passed
    db.show.updateMany({
      where: {
        status: 'LIVE',
        endsAt: { lte: now }
      },
      data: { status: 'ENDED' }
    }),
    // LIVE → ENDED (open-ended): shows with no endsAt otherwise stay LIVE
    // forever — the launch seeds sat "live" for weeks. 12h past startsAt is
    // a generous cap for any real set or radio marathon.
    db.show.updateMany({
      where: {
        status: 'LIVE',
        endsAt: null,
        startsAt: { lte: openEndedCutoff }
      },
      data: { status: 'ENDED' }
    })
  ]);

  return NextResponse.json({
    ok: true,
    transitionedToLive: toLive.count,
    transitionedToEnded: toEnded.count + staleEnded.count,
    evaluatedAt: now.toISOString()
  });
}
