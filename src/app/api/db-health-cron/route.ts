import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendGenericEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL ?? process.env.SMTP_FROM ?? 'admin@ihype.org';

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userCountResult, profileCountResult] = await Promise.all([
      db.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM "User"`,
      db.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM "Profile"`
    ]);

    const userCount = Number(userCountResult[0]?.count ?? 0);
    const profileCount = Number(profileCountResult[0]?.count ?? 0);

    const alerts: string[] = [];

    if (userCount === 0) {
      alerts.push(`User count is 0 — possible data loss or connection issue.`);
    }
    if (profileCount === 0) {
      alerts.push(`Profile count is 0 — possible data loss or connection issue.`);
    }

    // Check against KV stored counts if available
    try {
      const { kv } = await import('@vercel/kv');
      const lastUserCount = await kv.get<number>('db-health:user-count');
      const lastProfileCount = await kv.get<number>('db-health:profile-count');

      if (lastUserCount !== null && userCount < lastUserCount * 0.8) {
        alerts.push(`User count dropped from ${lastUserCount} to ${userCount} (>20% decrease).`);
      }
      if (lastProfileCount !== null && profileCount < lastProfileCount * 0.8) {
        alerts.push(`Profile count dropped from ${lastProfileCount} to ${profileCount} (>20% decrease).`);
      }

      await kv.set('db-health:user-count', userCount);
      await kv.set('db-health:profile-count', profileCount);
    } catch {
      // KV not available, skip threshold checks
    }

    if (alerts.length > 0) {
      await sendGenericEmail({
        to: ADMIN_EMAIL,
        subject: `[iHYPE] DB health alert`,
        text: alerts.join('\n\n') + `\n\nCurrent counts: users=${userCount}, profiles=${profileCount}`,
        html: `<p>${alerts.map((a) => `<strong>${a}</strong>`).join('<br/><br/>')}</p><p>Current counts: users=${userCount}, profiles=${profileCount}</p>`
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: alerts.length === 0,
      userCount,
      profileCount,
      alerts,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await sendGenericEmail({
      to: ADMIN_EMAIL,
      subject: '[iHYPE] DB health cron failed',
      text: `DB health cron threw an error: ${message}`,
      html: `<p>DB health cron threw an error: <code>${message}</code></p>`
    }).catch(() => {});

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
