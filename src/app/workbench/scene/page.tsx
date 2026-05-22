import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CITY_COORDS } from '@/lib/city-coords';

export const metadata: Metadata = { title: 'Scene Map · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

export default async function SceneMapPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const hypes = await db.profileHypeEvent.findMany({
    where: { userId },
    select: {
      profile: {
        select: {
          name: true, slug: true, city: true, stateRegion: true, country: true,
          type: true, genres: true, avatarImage: true
        }
      }
    }
  });

  if (hypes.length === 0) {
    return (
      <main className="wb-main">
        <div className="wb-content">
          <h1>Scene Map</h1>
          <div className="empty">
            <span className="empty-title">No hypes yet.</span>
            <p>Hype some artists to see where your music taste lives.</p>
            <Link href="/discover" className="button">Go to Discover</Link>
          </div>
        </div>
      </main>
    );
  }

  // Aggregate by city
  type CityData = { city: string; state: string | null; country: string | null; count: number; artists: string[]; genres: Set<string>; coords: { x: number; y: number } | null };
  const cityMap = new Map<string, CityData>();

  for (const h of hypes) {
    const cityRaw = h.profile.city?.trim() || null;
    if (!cityRaw) continue;
    const cityKey = cityRaw.toLowerCase();
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, {
        city: cityRaw,
        state: h.profile.stateRegion,
        country: h.profile.country,
        count: 0,
        artists: [],
        genres: new Set(),
        coords: CITY_COORDS[cityKey] ?? null
      });
    }
    const entry = cityMap.get(cityKey)!;
    entry.count++;
    if (entry.artists.length < 5) entry.artists.push(h.profile.name);
    for (const g of h.profile.genres) entry.genres.add(g.toLowerCase());
  }

  const cities = [...cityMap.values()].sort((a, b) => b.count - a.count);
  const maxCount = cities[0]?.count ?? 1;
  const mappedCities = cities.filter(c => c.coords !== null);
  const unmappedCities = cities.filter(c => c.coords === null);

  // Interesting stats
  const usCount = hypes.filter(h => h.profile.country?.toLowerCase().includes('us') || h.profile.stateRegion).length;
  const intlCount = hypes.length - usCount;
  const topScene = cities[0];

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Scene Map</h1>
          <p className="meta">Where your music taste lives, mapped by the artists you hype.</p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Cities', value: cities.length },
            { label: 'US artists', value: usCount },
            { label: 'International', value: intlCount },
            { label: 'Your #1 scene', value: topScene?.city ?? '—' },
          ].map(s => (
            <div key={s.label} className="panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4 }}>{s.label}</div>
              <div style={{ fontSize: typeof s.value === 'number' ? '1.5rem' : '1rem', fontWeight: 800, lineHeight: 1.15, textTransform: 'capitalize' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* SVG dot map */}
        {mappedCities.length > 0 && (
          <div className="panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>US Scene Map</h2>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '52%', background: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden' }}>
              <svg viewBox="0 0 100 52" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-label="US scene map">
                {/* Very rough US outline as background reference */}
                <rect x="5" y="5" width="90" height="42" rx="2" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
                {mappedCities.map(c => {
                  const cx = 5 + c.coords!.x * 90;
                  const cy = 5 + c.coords!.y * 42;
                  const r = Math.max(1.2, Math.min(4, 1.2 + (c.count / maxCount) * 3.5));
                  return (
                    <g key={c.city}>
                      <circle
                        cx={cx} cy={cy} r={r}
                        fill="var(--accent, #ff5029)"
                        fillOpacity={0.3 + (c.count / maxCount) * 0.7}
                        stroke="var(--accent, #ff5029)"
                        strokeWidth="0.3"
                        strokeOpacity={0.8}
                      >
                        <title>{c.city}: {c.count} artist{c.count !== 1 ? 's' : ''}</title>
                      </circle>
                      {c.count >= 2 && (
                        <text x={cx} y={cy - r - 0.8} fontSize="2.2" fill="rgba(255,255,255,0.6)" textAnchor="middle" style={{ pointerEvents: 'none' }}>
                          {c.city.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 3)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <p style={{ fontSize: '0.65rem', opacity: 0.35, marginTop: '0.5rem', marginBottom: 0 }}>Dot size = number of artists. Only US cities mapped.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Ranked scenes */}
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
              All scenes ({cities.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cities.slice(0, 15).map((c, i) => (
                <div key={c.city}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '0.6rem', opacity: 0.3, width: 12, textAlign: 'right' }}>{i + 1}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>{c.city}</span>
                      {c.state && <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>{c.state}</span>}
                    </div>
                    <span style={{ fontSize: '0.65rem', opacity: 0.45 }}>{c.count} artist{c.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.count / maxCount) * 100}%`, height: '100%', background: 'var(--accent, #ff5029)', borderRadius: 2 }} />
                  </div>
                  {c.artists.length > 0 && (
                    <div style={{ fontSize: '0.62rem', opacity: 0.35, marginTop: 2 }}>{c.artists.join(', ')}{c.count > c.artists.length ? ` +${c.count - c.artists.length}` : ''}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Genre breakdown per top scene */}
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
              Top scene genres
            </h2>
            {cities.slice(0, 5).map(c => {
              const genres = [...c.genres].slice(0, 4);
              if (!genres.length) return null;
              return (
                <div key={c.city} style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>{c.city}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {genres.map(g => (
                      <span key={g} style={{ fontSize: '0.62rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, textTransform: 'capitalize' }}>{g}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            {unmappedCities.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.65rem', opacity: 0.4 }}>
                +{unmappedCities.length} other cities (no map coords): {unmappedCities.slice(0, 5).map(c => c.city).join(', ')}{unmappedCities.length > 5 ? '…' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
