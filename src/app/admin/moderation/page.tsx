import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { AdminNav } from '@/components/AdminNav';
import { ModerationActions } from '@/components/ModerationActions';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const reports = await db.contentReport.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, reason: true, details: true, targetType: true, targetId: true, status: true, createdAt: true, reporter: { select: { username: true } } }
  });

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <AdminNav active="moderation" />
      <h1>Content Moderation ({reports.length} pending)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reports.length === 0 && <p className="meta">No pending reports.</p>}
        {reports.map(r => (
          <div key={r.id} className="panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.targetType} · <span className="meta">{r.reason}</span></div>
                <div className="meta">{r.details}</div>
                <div className="meta">Reported by {r.reporter?.username ?? 'anonymous'} · {new Date(r.createdAt).toLocaleDateString()}</div>
                <div className="meta">Content ID: {r.targetId}</div>
              </div>
              <ModerationActions reportId={r.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
