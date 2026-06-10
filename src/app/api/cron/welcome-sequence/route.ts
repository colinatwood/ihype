import { NextRequest, NextResponse } from 'next/server';
import { isCronRequestAuthorized } from '@/lib/cron-auth';
import { db } from '@/lib/db';
import { sendDay3NudgeEmail, sendDay7NudgeEmail } from '@/lib/welcome-emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Bound each run so the cron finishes inside the Worker time budget even if a
// signup spike piles up users; the next run picks up the remainder.
const BATCH_LIMIT = 500;
const SEND_CHUNK_SIZE = 10;

type NudgeUser = { id: string; email: string | null; name: string | null };

async function sendNudges(
  users: NudgeUser[],
  send: (user: { id: string; email: string; name: string | null }) => Promise<unknown>,
  markField: 'welcomeDay3SentAt' | 'welcomeDay7SentAt',
  now: Date
): Promise<number> {
  let sent = 0;
  for (let i = 0; i < users.length; i += SEND_CHUNK_SIZE) {
    const chunk = users.slice(i, i + SEND_CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(async (user) => {
        if (!user.email) return false;
        await send({ id: user.id, email: user.email, name: user.name });
        // Mark per user right after the send so a mid-run failure never
        // re-emails users that already got their nudge.
        await db.user.update({ where: { id: user.id }, data: { [markField]: now } });
        return true;
      })
    );
    sent += results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
  }
  return sent;
}

export async function GET(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const day3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const day3End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const day7Start = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const day7End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [day3Users, day7Users] = await Promise.all([
    db.user.findMany({
      where: { createdAt: { gte: day3Start, lt: day3End }, welcomeDay3SentAt: null },
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: 'asc' },
      take: BATCH_LIMIT,
    }),
    db.user.findMany({
      where: { createdAt: { gte: day7Start, lt: day7End }, welcomeDay7SentAt: null },
      select: { id: true, email: true, name: true },
      orderBy: { createdAt: 'asc' },
      take: BATCH_LIMIT,
    }),
  ]);

  const day3Sent = await sendNudges(day3Users, sendDay3NudgeEmail, 'welcomeDay3SentAt', now);
  const day7Sent = await sendNudges(day7Users, sendDay7NudgeEmail, 'welcomeDay7SentAt', now);

  return NextResponse.json({ ok: true, day3Sent, day7Sent });
}
