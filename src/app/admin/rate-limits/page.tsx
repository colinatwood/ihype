import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/permissions';
import { getRateLimitMetrics } from '@/lib/rate-limit';
import { AdminNav } from '@/components/AdminNav';

export const metadata: Metadata = {
  title: 'Rate Limits | Admin | iHYPE.org',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function AdminRateLimitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminSession(session)) redirect('/auth/landing');

  const metrics = await getRateLimitMetrics(50);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <AdminNav active="rate-limits" />
      <h1 style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', color: 'var(--ink)', marginBottom: 8 }}>
        Rate Limit Metrics
      </h1>
      <p style={{ fontFamily: 'var(--f-m)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 32 }}>
        Top {metrics.length} rate-limit buckets by request count.
      </p>

      {metrics.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-m)', fontSize: 14, color: 'var(--ink-3)' }}>No rate limit data available.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--f-m)', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 10 }}>Bucket key</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, fontSize: 10 }}>Hits</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.bucket} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--ink)', fontFamily: 'monospace', fontSize: 11 }}>
                    {m.bucket}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: m.hits > 100 ? '#ff3e9a' : 'var(--ink)' }}>
                    {m.hits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
