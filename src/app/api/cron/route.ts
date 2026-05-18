import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  if (request.headers.get('x-vercel-cron')) return true;
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const job = searchParams.get('job');

  switch (job) {
    case 'digest': {
      const { sendDigestsToAllEligibleUsers } = await import('@/lib/email-digest');
      const summary = await sendDigestsToAllEligibleUsers();
      return NextResponse.json(summary);
    }

    case 'artist-digest': {
      const { sendArtistWeeklyDigest } = await import('@/lib/artist-digest');
      const { db } = await import('@/lib/db');
      const profiles = await db.profile.findMany({
        where: { type: { in: ['ARTIST', 'DJ'] } },
        select: { id: true }
      });
      let sent = 0;
      for (const p of profiles) {
        try { await sendArtistWeeklyDigest(p.id); sent++; } catch { /* continue */ }
      }
      return NextResponse.json({ ok: true, sent });
    }

    case 'health-check': {
      const { getHealthSnapshot } = await import('@/lib/health');
      const { isEmailDeliveryConfigured, sendGenericEmail } = await import('@/lib/mailer');
      const snapshot = await getHealthSnapshot();
      if (snapshot.status !== 'ok' && isEmailDeliveryConfigured()) {
        try {
          const summary = JSON.stringify(snapshot, null, 2);
          await sendGenericEmail({
            to: 'admin@ihype.org',
            subject: '[iHYPE] Health check failure',
            text: `iHYPE health check returned non-ok status.\n\n${summary}`,
            html: `<p>iHYPE health check returned non-ok status.</p><pre style="font-family:monospace;font-size:12px;background:#0a0805;color:#f0ebe5;padding:12px;border-radius:6px;white-space:pre-wrap;">${summary.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`
          });
        } catch (err) {
          console.error('[cron/health-check] alert email failed', err);
        }
      }
      return NextResponse.json(snapshot, {
        status: snapshot.status === 'ok' ? 200 : 503,
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    case 'onboarding': {
      const { db } = await import('@/lib/db');
      const { sendDay3Email, sendDay7Email } = await import('@/lib/onboarding-emails');
      const now = new Date();
      const day3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
      const day3End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const day7Start = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
      const day7End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const [day3Users, day7Users] = await Promise.all([
        db.user.findMany({ where: { createdAt: { gte: day3Start, lt: day3End } }, select: { id: true, profileHypeEvents: { take: 1, select: { id: true } } } }),
        db.user.findMany({ where: { createdAt: { gte: day7Start, lt: day7End } }, select: { id: true, profileHypeEvents: { take: 1, select: { id: true } } } })
      ]);
      let sent3 = 0, sent7 = 0;
      for (const user of day3Users) {
        if (user.profileHypeEvents.length === 0) { try { await sendDay3Email(user.id); sent3++; } catch { /* continue */ } }
      }
      for (const user of day7Users) {
        if (user.profileHypeEvents.length === 0) { try { await sendDay7Email(user.id); sent7++; } catch { /* continue */ } }
      }
      return NextResponse.json({ ok: true, sent3, sent7 });
    }

    case 'show-reminders': {
      const { sendShowReminders } = await import('@/lib/show-reminders');
      const { sent } = await sendShowReminders();
      return NextResponse.json({ ok: true, sent });
    }

    case 'db-health': {
      const { db } = await import('@/lib/db');
      const { sendGenericEmail } = await import('@/lib/mailer');
      const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL ?? process.env.SMTP_FROM ?? 'admin@ihype.org';
      const [userCountResult, profileCountResult] = await Promise.all([
        db.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM "User"`,
        db.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM "Profile"`
      ]);
      const userCount = Number(userCountResult[0]?.count ?? 0);
      const profileCount = Number(profileCountResult[0]?.count ?? 0);
      const alerts: string[] = [];
      if (userCount === 0) alerts.push('User count is 0 — possible data loss or connection issue.');
      if (profileCount === 0) alerts.push('Profile count is 0 — possible data loss or connection issue.');
      try {
        const { kv } = await import('@vercel/kv');
        const lastUserCount = await kv.get<number>('db-health:user-count');
        const lastProfileCount = await kv.get<number>('db-health:profile-count');
        if (lastUserCount !== null && userCount < lastUserCount * 0.8) alerts.push(`User count dropped from ${lastUserCount} to ${userCount} (>20% decrease).`);
        if (lastProfileCount !== null && profileCount < lastProfileCount * 0.8) alerts.push(`Profile count dropped from ${lastProfileCount} to ${profileCount} (>20% decrease).`);
        await kv.set('db-health:user-count', userCount);
        await kv.set('db-health:profile-count', profileCount);
      } catch { /* KV not available */ }
      if (alerts.length > 0) {
        await sendGenericEmail({ to: ADMIN_EMAIL, subject: '[iHYPE] DB health alert', text: alerts.join('\n\n') + `\n\nCurrent counts: users=${userCount}, profiles=${profileCount}`, html: `<p>${alerts.map(a => `<strong>${a}</strong>`).join('<br/><br/>')}</p>` }).catch(() => {});
      }
      return NextResponse.json({ ok: alerts.length === 0, userCount, profileCount, alerts, checkedAt: new Date().toISOString() });
    }

    case 'weekly-picks': {
      const { sendWeeklyPicksEmails } = await import('@/lib/weekly-picks');
      const result = await sendWeeklyPicksEmails();
      return NextResponse.json({ ok: true, ...result });
    }

    case 'admin-report': {
      const { sendAdminWeeklyReport } = await import('@/lib/admin-report');
      const result = await sendAdminWeeklyReport();
      return NextResponse.json(result);
    }

    case 'new-to-scene': {
      const { sendNewToSceneEmail } = await import('@/lib/new-to-scene');
      const result = await sendNewToSceneEmail();
      return NextResponse.json({ ok: true, ...result });
    }

    default:
      return NextResponse.json({ error: 'Unknown job. Use ?job=digest|artist-digest|health-check|onboarding|show-reminders|db-health|weekly-picks|admin-report|new-to-scene' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
