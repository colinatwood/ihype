import { NextRequest, NextResponse } from 'next/server';
import { isCronRequestAuthorized } from '@/lib/cron-auth';
import { db } from '@/lib/db';
import { sendWeeklyDigestEmail } from '@/lib/weekly-digest-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH = 200;
const CHUNK = 10;

export async function GET(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  lastMonday.setHours(0, 0, 0, 0);

  // Users who haven't received a digest since last Monday
  const users = await db.user.findMany({
    where: {
      email: { not: null },
      emailBounced: false,
      OR: [
        { weeklyDigestSentAt: null },
        { weeklyDigestSentAt: { lt: lastMonday } },
      ],
    },
    select: { id: true, email: true, name: true },
    take: BATCH,
  }).catch(() => [] as { id: string; email: string | null; name: string | null }[]);

  let sent = 0;
  for (let i = 0; i < users.length; i += CHUNK) {
    await Promise.allSettled(users.slice(i, i + CHUNK).map(async u => {
      if (!u.email) return;

      const [hyped, saved] = await Promise.all([
        db.seed.count({ where: { userId: u.id, action: 'hype', createdAt: { gte: weekAgo } } }),
        db.seed.count({ where: { userId: u.id, action: 'save', createdAt: { gte: weekAgo } } }),
      ]);

      if (hyped === 0 && saved === 0) {
        // Skip users with no activity — nothing to report
        return;
      }

      // Calculate hype streak
      const hypeDays = await db.seed.findMany({
        where: { userId: u.id, action: 'hype', createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true },
      }).catch(() => [] as { createdAt: Date }[]);
      const days = new Set(hypeDays.map(h => {
        const d = new Date(h.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }));
      let hypeStreak = 0;
      for (let j = 0; j < 30; j++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - j);
        if (!days.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) break;
        hypeStreak++;
      }

      await sendWeeklyDigestEmail({ id: u.id, email: u.email, name: u.name, hypeStreak, hyped, saved });
      await db.user.update({ where: { id: u.id }, data: { weeklyDigestSentAt: now } });
      sent++;
    }));
  }

  return NextResponse.json({ ok: true, sent });
}
