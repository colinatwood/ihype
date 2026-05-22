import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Hype Streaks · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

const MILESTONES = [7, 30, 100, 365] as const;

function toUTCDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calcStreaks(sortedDays: string[]): { current: number; longest: number } {
  if (sortedDays.length === 0) return { current: 0, longest: 0 };

  const todayStr = toUTCDateStr(new Date());
  const yesterdayStr = toUTCDateStr(new Date(Date.now() - 86_400_000));
  const daySet = new Set(sortedDays);

  let current = 0;
  const anchor = daySet.has(todayStr) ? todayStr : daySet.has(yesterdayStr) ? yesterdayStr : null;
  if (anchor) {
    let cursor = new Date(anchor + 'T00:00:00Z');
    while (daySet.has(toUTCDateStr(cursor))) {
      current++;
      cursor = new Date(cursor.getTime() - 86_400_000);
    }
  }

  let longest = 0;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1] + 'T00:00:00Z');
    const curr = new Date(sortedDays[i] + 'T00:00:00Z');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      run++;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  return { current, longest };
}

function buildGrid(dayMap: Map<string, number>): { dateStr: string; count: number }[][] {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const dow = todayUTC.getUTCDay();
  const endOffset = dow === 0 ? 6 : dow - 1;
  const gridEnd = new Date(todayUTC.getTime() + (6 - endOffset) * 86_400_000);

  const weeks: { dateStr: string; count: number }[][] = [];
  for (let w = 12; w >= 0; w--) {
    const week: { dateStr: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const offset = w * 7 + (6 - d);
      const day = new Date(gridEnd.getTime() - offset * 86_400_000);
      const dateStr = toUTCDateStr(day);
      week.push({ dateStr, count: dayMap.get(dateStr) ?? 0 });
    }
    weeks.push(week);
  }
  return weeks;
}

function cellOpacity(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 0.5;
  if (count === 2) return 0.75;
  return 1.0;
}

export default async function StreaksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const events = await db.profileHypeEvent.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  if (events.length === 0) {
    return (
      <main className="wb-main">
        <div className="wb-content" style={{ maxWidth: 860, margin: '0 auto' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Hype Streaks</h1>
          <div className="empty">
            <span className="empty-title">No hypes yet.</span>
            <p>Hype an artist every day to build your streak.</p>
            <Link href="/discover" className="button">Go to Discover</Link>
          </div>
        </div>
      </main>
    );
  }

  const dayMap = new Map<string, number>();
  for (const e of events) {
    const k = toUTCDateStr(e.createdAt);
    dayMap.set(k, (dayMap.get(k) ?? 0) + 1);
  }
  const sortedDays = [...dayMap.keys()].sort();
  const totalActiveDays = sortedDays.length;
  const { current, longest } = calcStreaks(sortedDays);
  const grid = buildGrid(dayMap);

  const earnedMilestones = MILESTONES.filter(m => longest >= m);

  const recentDays = sortedDays.slice(-14).reverse();

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Hype Streaks</h1>
          <p className="meta">Consecutive days hyping at least one artist.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.45 }}>Current streak</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1, color: current > 0 ? 'var(--accent, #ff5029)' : 'inherit' }}>{current}d</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>consecutive days</div>
          </div>
          <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.45 }}>Longest streak</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>{longest}d</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>all time best</div>
          </div>
          <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.45 }}>Active days</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>{totalActiveDays}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>days with a hype</div>
          </div>
          <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.45 }}>Total hypes</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>{events.length}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>across all time</div>
          </div>
        </div>

        {earnedMilestones.length > 0 && (
          <div className="panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: '0.75rem' }}>Milestone badges</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {earnedMilestones.map(m => (
                <span
                  key={m}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: 'rgba(255,80,41,0.18)',
                    border: '1px solid rgba(255,80,41,0.4)',
                    color: 'var(--accent, #ff5029)',
                    letterSpacing: '0.02em',
                  }}
                >
                  🔥 {m}-day streak
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: '0.75rem' }}>Activity — last 13 weeks</div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4, paddingTop: 0 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => (
                <div key={i} style={{ width: 10, height: 10, fontSize: '0.52rem', opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  {i % 2 === 0 ? label : ''}
                </div>
              ))}
            </div>
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {week.map(({ dateStr, count }) => (
                  <div
                    key={dateStr}
                    title={count > 0 ? `${dateStr}: ${count} hype${count !== 1 ? 's' : ''}` : dateStr}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: count > 0 ? 'var(--accent, #ff5029)' : 'rgba(255,255,255,0.06)',
                      opacity: count > 0 ? cellOpacity(count) : 1,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', opacity: 0.35 }}>Less</span>
            {[0, 1, 2, 3].map(n => (
              <div key={n} style={{ width: 10, height: 10, borderRadius: 2, background: n === 0 ? 'rgba(255,255,255,0.06)' : 'var(--accent, #ff5029)', opacity: n === 0 ? 1 : cellOpacity(n) }} />
            ))}
            <span style={{ fontSize: '0.6rem', opacity: 0.35 }}>More</span>
          </div>
        </div>

        {recentDays.length > 0 && (
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: '0.75rem' }}>Recent activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentDays.map((dateStr, i) => {
                const count = dayMap.get(dateStr) ?? 0;
                const date = new Date(dateStr + 'T00:00:00Z');
                const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
                return (
                  <div
                    key={dateStr}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '7px 0',
                      borderBottom: i < recentDays.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        flexShrink: 0,
                        background: 'var(--accent, #ff5029)',
                        opacity: cellOpacity(count),
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', flex: 1 }}>{label}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.45 }}>{count} hype{count !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
