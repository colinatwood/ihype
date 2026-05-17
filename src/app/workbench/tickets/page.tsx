import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Ticket Sales · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

export default async function TicketsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // Find profiles owned by the user that can host shows
  const profiles = await db.profile.findMany({
    where: { ownerId: userId, type: { in: ['ARTIST', 'VENUE', 'DJ'] } },
    select: { id: true, name: true, type: true }
  });

  if (profiles.length === 0) {
    return (
      <main className="container section" style={{ maxWidth: 900 }}>
        <h1>Ticket Sales</h1>
        <p className="meta">No artist, venue, or promoter profiles found on this account.</p>
      </main>
    );
  }

  const profileIds = profiles.map((p) => p.id);

  const shows = await db.show.findMany({
    where: {
      isTicketed: true,
      OR: [
        { headlinerProfileId: { in: profileIds } },
        { venueProfileId: { in: profileIds } }
      ]
    },
    include: {
      venueProfile: { select: { name: true } },
      headlinerProfile: { select: { name: true } },
      _count: { select: { tickets: true } }
    },
    orderBy: { startsAt: 'desc' },
    take: 50
  });

  // Fetch revenue per show
  const showIds = shows.map((s) => s.id);
  const revenueRows = showIds.length > 0
    ? await db.ticketOrder.groupBy({
        by: ['showId'],
        where: { showId: { in: showIds }, status: 'CAPTURED' },
        _sum: { subtotalCents: true },
        _count: { id: true }
      })
    : [];
  const revenueMap = new Map(revenueRows.map((r) => [r.showId, { cents: r._sum.subtotalCents ?? 0, orders: r._count.id }]));

  return (
    <main className="container section" style={{ maxWidth: 1000 }}>
      <h1 style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 28 }}>Ticket Sales</h1>
      <p className="meta" style={{ marginBottom: 24 }}>{shows.length} ticketed show{shows.length !== 1 ? 's' : ''}</p>

      {shows.length === 0 ? (
        <p className="meta">No ticketed shows yet. Enable ticketing when creating a show.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--f-m)', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--ink-3)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Show</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tickets sold</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Capacity</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Revenue</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s) => {
                const rev = revenueMap.get(s.id);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--ink)', fontWeight: 600 }}>
                      {s.title}
                      {(s as any).venueProfile?.name ? <span style={{ fontWeight: 400, color: 'var(--ink-2)' }}> @ {(s as any).venueProfile.name}</span> : null}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--ink-2)' }}>
                      {s.startsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{s.ticketsSoldCount}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--ink-2)' }}>{s.ticketCapacity ?? '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#22e5d4' }}>
                      {rev ? `$${(rev.cents / 100).toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        letterSpacing: '.06em',
                        background: s.status === 'LIVE' ? 'rgba(255,62,154,.15)' : 'rgba(34,229,212,.1)',
                        color: s.status === 'LIVE' ? '#ff3e9a' : '#22e5d4'
                      }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
