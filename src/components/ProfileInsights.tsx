'use client';

import { useEffect, useState, type ReactNode } from 'react';

type InsightsData = {
  hypeTotal: number;
  followerCount: number;
  bookingRequests: { pending: number; accepted: number; declined: number };
  listeners?: { distinctListeners: number; totalPlays: number };
  topTracks?: { title: string; plays: number }[];
  hypePositions?: { early: number; mid: number; late: number; untracked: number };
  topCities?: { city: string; count: number }[];
  ticketRevenueCents?: number;
  ticketsSold?: number;
};

type ChartDay = { date: string; count: number };

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.06)',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(240,235,229,.5)', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p style={{ fontSize: 13, color: 'rgba(240,235,229,.45)', margin: 0 }}>{text}</p>;
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value.toLocaleString()}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.14em', color: 'rgba(240,235,229,.55)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function PositionBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(240,235,229,.7)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(pct, value > 0 ? 3 : 0)}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

/**
 * Owner-only Insights section for Artist/Venue/DJ pages — real aggregates
 * only (listens, hype counts, hype-during-playback timing, ticket/booking
 * data where relevant), never mock numbers. Rendered from each profile
 * page's own section-tab mechanism, gated behind that page's isOwner check.
 */
export function ProfileInsights({ profileId, profileType }: { profileId: string; profileType: string }) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [chart, setChart] = useState<ChartDay[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/profile-insights?profileId=${profileId}`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`/api/hype/chart?profileId=${profileId}`).then((r) => (r.ok ? r.json() : { days: [] })),
    ])
      .then(([insights, chartRes]) => {
        if (cancelled) return;
        setData(insights);
        setChart(chartRes.days ?? []);
      })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [profileId]);

  if (error) return <EmptyNote text="Couldn't load insights right now." />;
  if (!data) return <EmptyNote text="Loading insights…" />;

  const maxDay = Math.max(1, ...chart.map((d) => d.count));
  const hasChartActivity = chart.some((d) => d.count > 0);
  const positions = data.hypePositions;
  const maxPositionBucket = positions ? Math.max(positions.early, positions.mid, positions.late) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <Stat label="Hypes" value={data.hypeTotal} color="var(--accent, #ff5029)" />
        <Stat label="Followers" value={data.followerCount} color="#b983ff" />
        {data.listeners && <Stat label="Listeners" value={data.listeners.distinctListeners} color="#22e5d4" />}
        {typeof data.ticketsSold === 'number' && <Stat label="Tickets sold" value={data.ticketsSold} color="#22e5d4" />}
      </div>

      {typeof data.ticketRevenueCents === 'number' && (
        <Section title="Ticket revenue">
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            ${(data.ticketRevenueCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </Section>
      )}

      <Section title="Hype activity — last 30 days">
        {hasChartActivity ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 70 }}>
            {chart.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                style={{
                  flex: 1, minWidth: 2, height: `${Math.max(4, (d.count / maxDay) * 100)}%`,
                  background: 'var(--accent, #ff5029)', borderRadius: 2, opacity: d.count > 0 ? 0.85 : 0.15,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyNote text="No hype activity yet in the last 30 days." />
        )}
      </Section>

      {data.topTracks && (
        <Section title="Top tracks">
          {data.topTracks.length ? (
            <div>
              {data.topTracks.map((t) => (
                <div key={t.title} style={rowStyle}>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>{t.title}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'rgba(240,235,229,.55)' }}>
                    {t.plays} listener{t.plays === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNote text="No listens yet." />
          )}
        </Section>
      )}

      {positions && (
        <Section title="When people HYPE during a show">
          {positions.early + positions.mid + positions.late > 0 ? (
            <div>
              <PositionBar label="Early third" value={positions.early} max={maxPositionBucket} color="#ff5029" />
              <PositionBar label="Middle third" value={positions.mid} max={maxPositionBucket} color="#b983ff" />
              <PositionBar label="Final third" value={positions.late} max={maxPositionBucket} color="#22e5d4" />
              {positions.untracked > 0 && (
                <p style={{ fontSize: 11, color: 'rgba(240,235,229,.4)', marginTop: 8 }}>
                  +{positions.untracked} more hype{positions.untracked === 1 ? '' : 's'} fired without an active player open (position unknown).
                </p>
              )}
            </div>
          ) : (
            <EmptyNote text="No timestamped hype data yet — this fills in as people hype your shows while listening live." />
          )}
        </Section>
      )}

      {data.topCities && (
        <Section title={profileType === 'VENUE' ? 'Where ticket buyers travel from' : 'Where your fans are'}>
          {data.topCities.length ? (
            <div>
              {data.topCities.map((c) => (
                <div key={c.city} style={rowStyle}>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>{c.city}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'rgba(240,235,229,.55)' }}>{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNote text="No ticket sales with a known location yet." />
          )}
        </Section>
      )}

      <Section title="Booking requests">
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <Stat label="Pending" value={data.bookingRequests.pending} color="#ff5029" />
          <Stat label="Accepted" value={data.bookingRequests.accepted} color="#22e5d4" />
          <Stat label="Declined" value={data.bookingRequests.declined} color="rgba(240,235,229,.5)" />
        </div>
      </Section>
    </div>
  );
}
