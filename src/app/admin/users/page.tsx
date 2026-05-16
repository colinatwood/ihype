import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/permissions';
import { AdminNav } from '@/components/AdminNav';
import { promoteToAdminAction, suspendUserAction } from './actions';

export const metadata: Metadata = {
  title: 'User management | iHYPE Admin',
  robots: { index: false, follow: false }
};

type SearchParams = { q?: string };

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminSession(session)) redirect('/auth/landing');

  const resolved = (await searchParams) ?? {};
  const q = (resolved.q ?? '').trim();

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' as const } },
          { username: { contains: q, mode: 'insensitive' as const } }
        ]
      }
    : {};

  const users = await db.user.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { passkeys: true } }
    }
  });

  return (
    <main className="container section admin-console">
      <AdminNav active="users" />
      <section className="panel admin-console-hero">
        <div>
          <div className="badge">User management</div>
          <h1>Users</h1>
          <p className="subtitle">Search and manage user accounts. Suspensions are audit-logged (no schema field).</p>
        </div>
      </section>

      <section className="panel admin-console-panel">
        <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by email or username..."
            className="input"
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.2)',
              color: 'inherit'
            }}
          />
          <button className="button" type="submit">Search</button>
          {q ? (
            <Link className="button secondary" href="/admin/users">Clear</Link>
          ) : null}
        </form>

        <div className="admin-list">
          {users.length === 0 ? (
            <div className="empty">No users found.</div>
          ) : (
            users.map((user) => (
              <div className="admin-list-row" key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ minWidth: 140 }}>{user.username || '—'}</span>
                <strong style={{ minWidth: 220 }}>{user.email || '—'}</strong>
                <small>{user.role}</small>
                <small>{user.createdAt.toISOString().slice(0, 10)}</small>
                <small>{user._count.passkeys} passkey{user._count.passkeys === 1 ? '' : 's'}</small>
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                  <form action={suspendUserAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button className="button small secondary" type="submit">Suspend</button>
                  </form>
                  {user.role !== 'ADMIN' ? (
                    <form action={promoteToAdminAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button className="button small" type="submit">Make Admin</button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
