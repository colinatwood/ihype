import type { Metadata } from 'next';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'System Status · iHYPE',
  robots: { index: false, follow: false },
};

const REQUIRED_ENV_VARS = ['RESEND_API_KEY', 'AUTH_SECRET', 'DATABASE_URL'] as const;

async function checkDb(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkResend(): Promise<{ ok: boolean; label: string }> {
  if (!process.env.RESEND_API_KEY) return { ok: false, label: 'API key missing' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
    });
    // 200 or 405 both mean the key is valid
    return { ok: res.status < 500, label: res.status < 500 ? 'Reachable' : `HTTP ${res.status}` };
  } catch {
    return { ok: false, label: 'Unreachable' };
  }
}

async function checkKv(): Promise<{ ok: boolean; label: string }> {
  if (!process.env.KV_REST_API_URL) return { ok: false, label: 'Not configured' };
  try {
    const { kv } = await import('@vercel/kv');
    await kv.ping();
    return { ok: true, label: 'Connected' };
  } catch {
    return { ok: false, label: 'Error' };
  }
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: ok ? '#22e5d4' : '#ff3e3e',
        marginRight: 8,
        flexShrink: 0,
      }}
    />
  );
}

export default async function StatusPage() {
  const [dbOk, resendResult, kvResult] = await Promise.all([
    checkDb(),
    checkResend(),
    checkKv()
  ]);

  const envChecks = REQUIRED_ENV_VARS.map((key) => ({
    key,
    ok: Boolean(process.env[key]),
  }));

  const anthropicPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  const stripePresent = Boolean(process.env.STRIPE_SECRET_KEY);

  const allOk =
    dbOk &&
    resendResult.ok &&
    anthropicPresent &&
    stripePresent &&
    envChecks.every((c) => c.ok);

  return (
    <main className="container section" style={{ maxWidth: 560 }}>
      <h1 className="title">System Status</h1>
      <p className="meta" style={{ marginBottom: 24 }}>
        {allOk ? '✅ All systems operational' : '⚠️ Some checks failed'}
      </p>

      <div className="panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusDot ok={dbOk} />
          <span>Database</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>{dbOk ? 'Connected' : 'Error'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusDot ok={resendResult.ok} />
          <span>Resend (email)</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>{resendResult.label}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusDot ok={kvResult.ok} />
          <span>KV (Vercel KV)</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>{kvResult.label}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusDot ok={anthropicPresent} />
          <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 13 }}>ANTHROPIC_API_KEY</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>{anthropicPresent ? 'Present' : 'Missing'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusDot ok={stripePresent} />
          <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 13 }}>STRIPE_SECRET_KEY</span>
          <span className="meta" style={{ marginLeft: 'auto' }}>{stripePresent ? 'Present' : 'Missing'}</span>
        </div>

        {envChecks.map(({ key, ok }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
            <StatusDot ok={ok} />
            <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 13 }}>{key}</span>
            <span className="meta" style={{ marginLeft: 'auto' }}>{ok ? 'Present' : 'Missing'}</span>
          </div>
        ))}
      </div>

      <p className="meta" style={{ marginTop: 16 }}>
        Checked at {new Date().toUTCString()}
      </p>
    </main>
  );
}
