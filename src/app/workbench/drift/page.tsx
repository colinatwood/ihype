import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Taste Drift · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

type Window = '3m' | '6m' | '12m';

function getWindowCutoffs(window: Window): { nowStart: Date; nowEnd: Date; thenStart: Date; thenEnd: Date } {
  const now = new Date();
  const weeksAgo = (n: number) => new Date(now.getTime() - n * 7 * 24 * 60 * 60 * 1000);
  const monthsAgo = (n: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d;
  };
  if (window === '12m') {
    return { nowEnd: now, nowStart: monthsAgo(3), thenEnd: monthsAgo(9), thenStart: monthsAgo(12) };
  }
  if (window === '3m') {
    return { nowEnd: now, nowStart: weeksAgo(6), thenEnd: weeksAgo(6), thenStart: weeksAgo(12) };
  }
  return { nowEnd: now, nowStart: monthsAgo(2), thenEnd: monthsAgo(4), thenStart: monthsAgo(6) };
}

function buildGenreMap(hypes: { createdAt: Date; profile: { genres: string[]; city: string | null } | null }[], start: Date, end: Date): Map<string, number> {
  const map = new Map<string, number>();
  for (const h of hypes) {
    if (h.createdAt < start || h.createdAt > end) continue;
    for (const g of h.profile?.genres ?? []) {
      const key = g.toLowerCase().trim();
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return map;
}

function buildCityMap(hypes: { createdAt: Date; profile: { genres: string[]; city: string | null } | null }[], start: Date, end: Date): Map<string, number> {
  const map = new Map<string, number>();
  for (const h of hypes) {
    if (h.createdAt < start || h.createdAt > end) continue;
    const city = h.profile?.city?.trim();
    if (city) map.set(city, (map.get(city) ?? 0) + 1);
  }
  return map;
}

function topN<T>(map: Map<T, number>, n: number): T[] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

function jaccard(a: Map<string, number>, b: Map<string, number>): number {
  const setA = new Set(a.keys());
  const setB = new Set(b.keys());
  const intersection = [...setA].filter(k => setB.has(k)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 1;
  return intersection / union;
}

function countHypesInWindow(hypes: { createdAt: Date }[], start: Date, end: Date): number {
  return hypes.filter(h => h.createdAt >= start && h.createdAt <= end).length;
}

function driftLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'Loyal', color: '#4ade80' };
  if (score <= 40) return { label: 'Evolving', color: 'var(--accent, #ff5029)' };
  if (score <= 60) return { label: 'Shifting', color: '#a78bfa' };
  return { label: 'Transformed', color: '#f472b6' };
}

export default async function TasteDriftPage({ searchParams }: { searchParams: Promise<{ window?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const params = await searchParams;
  const rawWindow = params.window;
  const window: Window = rawWindow === '3m' || rawWindow === '12m' ? rawWindow : '6m';

  const hypes = await db.profileHypeEvent.findMany({
    where: { userId },
    select: { createdAt: true, profile: { select: { genres: true, city: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const { nowStart, nowEnd, thenStart, thenEnd } = getWindowCutoffs(window);

  const nowGenres = buildGenreMap(hypes, nowStart, nowEnd);
  const thenGenres = buildGenreMap(hypes, thenStart, thenEnd);

  const nowCities = buildCityMap(hypes, nowStart, nowEnd);
  const thenCities = buildCityMap(hypes, thenStart, thenEnd);

  const nowCount = countHypesInWindow(hypes, nowStart, nowEnd);
  const thenCount = countHypesInWindow(hypes, thenStart, thenEnd);

  const enoughData = nowCount >= 5 && thenCount >= 5;

  const jaccardScore = enoughData ? jaccard(thenGenres, nowGenres) : null;
  const driftScore = jaccardScore !== null ? Math.round((1 - jaccardScore) * 100) : null;

  const nowSet = new Set(nowGenres.keys());
  const thenSet = new Set(thenGenres.keys());

  const newGenres = [...nowSet].filter(g => !thenSet.has(g));
  const fadingGenres = [...thenSet].filter(g => !nowSet.has(g));
  const stableGenres = [...nowSet].filter(g => thenSet.has(g));

  const topCitiesNow = topN(nowCities, 3);
  const topCitiesThen = topN(thenCities, 3);

  const drift = driftScore !== null ? driftLabel(driftScore) : null;

  const windowLabels: Record<Window, string> = { '3m': '3M', '6m': '6M', '12m': '12M' };

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 4 }}>
          <h1 style={{ margin: 0 }}>Taste Drift</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 24 }}>
          How much has your music taste changed?
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {(['3m', '6m', '12m'] as Window[]).map(w => (
            <Link
              key={w}
              href={`/workbench/drift?window=${w}`}
              style={{
                padding: '6px 18px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                background: window === w ? 'var(--accent, #ff5029)' : 'rgba(255,255,255,0.07)',
                color: window === w ? '#fff' : 'rgba(255,255,255,0.6)',
                border: '1px solid',
                borderColor: window === w ? 'transparent' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.15s',
              }}
            >
              {windowLabels[w]}
            </Link>
          ))}
        </div>

        {!enoughData ? (
          <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Not enough data</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              You need at least 5 hypes in each time window to compare.
              {nowCount < 5 && thenCount < 5
                ? ' Both windows need more activity.'
                : nowCount < 5
                ? ` Recent window only has ${nowCount} hype${nowCount === 1 ? '' : 's'}.`
                : ` Earlier window only has ${thenCount} hype${thenCount === 1 ? '' : 's'}.`}
            </p>
            <Link href="/discover" className="button" style={{ marginTop: 20, display: 'inline-block' }}>
              Go to Discover
            </Link>
          </div>
        ) : (
          <>
            <div className="panel" style={{ marginBottom: 24, padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Drift Score
                  </div>
                  <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: drift!.color }}>
                    {driftScore}%
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: drift!.color, marginTop: 4 }}>
                    {drift!.label}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${driftScore}%`,
                        borderRadius: 6,
                        background: `linear-gradient(90deg, #4ade80, ${drift!.color})`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    <span>0% Loyal</span>
                    <span>100% Transformed</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 12, marginBottom: 0 }}>
                    {jaccardScore !== null && (
                      <>Genre overlap: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{Math.round(jaccardScore * 100)}%</strong> of genres appear in both windows</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div className="panel" style={{ padding: '20px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--accent, #ff5029)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  New ({newGenres.length})
                </div>
                {newGenres.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>None</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {newGenres.sort().map(g => (
                      <span key={g} style={{
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        background: 'rgba(255,80,41,0.15)',
                        color: 'var(--accent, #ff5029)',
                        border: '1px solid rgba(255,80,41,0.3)',
                      }}>{g}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel" style={{ padding: '20px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Stable ({stableGenres.length})
                </div>
                {stableGenres.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>None</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {stableGenres.sort().map(g => (
                      <span key={g} style={{
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.75)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}>{g}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel" style={{ padding: '20px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Fading ({fadingGenres.length})
                </div>
                {fadingGenres.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>None</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {fadingGenres.sort().map(g => (
                      <span key={g} style={{
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        textDecoration: 'line-through',
                        opacity: 0.4,
                      }}>{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="panel" style={{ padding: '24px 28px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Scene Drift</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Then
                  </div>
                  {topCitiesThen.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No city data</div>
                  ) : (
                    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {topCitiesThen.map((city, i) => (
                        <li key={city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 16, textAlign: 'right' }}>{i + 1}</span>
                          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{city}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Now
                  </div>
                  {topCitiesNow.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No city data</div>
                  ) : (
                    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {topCitiesNow.map((city, i) => (
                        <li key={city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 16, textAlign: 'right' }}>{i + 1}</span>
                          <span style={{ fontSize: 14, color: 'var(--accent, #ff5029)' }}>{city}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
