'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type ShowStats = { id: string; title: string; startsAt: string; ticketsSoldCount: number; ticketCapacity: number | null; ticketPriceCents: number; promoterPayoutPercent: number };
type ProfileAnalytics = { id: string; name: string; slug: string; hypeCount: number; hypeTrend: { day: number; count: number }[]; followerGrowth: number; upcomingShows: ShowStats[] };

export function ArtistAnalyticsDashboard() {
  const [data, setData] = useState<ProfileAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workbench/analytics').then(r => r.json()).then(d => { setData(d.profiles ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="meta">Loading analytics…</div>;
  if (data.length === 0) return <div className="meta">No profiles found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {data.map(p => {
        const maxHype = Math.max(...p.hypeTrend.map(h => h.count), 1);
        return (
          <div key={p.id} className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}><Link href={`/artists/${p.slug}`}>{p.name}</Link></h3>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{p.hypeCount}</div><div className="meta">Total hypes</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>+{p.followerGrowth}</div><div className="meta">New followers (30d)</div></div>
              </div>
            </div>
            <div>
              <div className="meta" style={{ marginBottom: 6 }}>Hype activity (7 days)</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 48 }}>
                {p.hypeTrend.map((h, i) => (
                  <div key={i} title={`${h.count} hypes`} style={{ flex: 1, background: 'var(--accent)', borderRadius: 3, minHeight: 4, height: `${Math.max(4, (h.count / maxHype) * 48)}px`, opacity: 0.7 + (i / 7) * 0.3 }} />
                ))}
              </div>
            </div>
            {p.upcomingShows.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="meta" style={{ marginBottom: 6 }}>Upcoming shows</div>
                {p.upcomingShows.map(s => {
                  const payout = Math.round((s.ticketPriceCents / 100) * s.ticketsSoldCount * (1 - s.promoterPayoutPercent / 100) * 0.95);
                  const fillPct = s.ticketCapacity ? Math.round((s.ticketsSoldCount / s.ticketCapacity) * 100) : null;
                  return (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                      <div><div style={{ fontWeight: 600 }}>{s.title}</div><div className="meta">{new Date(s.startsAt).toLocaleDateString()}</div></div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{s.ticketsSoldCount} tickets{fillPct !== null ? ` (${fillPct}%)` : ''}</div>
                        <div className="meta">~${payout} est. payout</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
