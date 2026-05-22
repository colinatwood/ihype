import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Artist Growth · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

type SortKey = 'growth' | 'discovered' | 'current' | 'early';

export default async function GrowthPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const sp = await searchParams;
  const sort = (['growth', 'discovered', 'current', 'early'].includes(sp.sort ?? '') ? sp.sort : 'growth') as SortKey;

  const myHypes = await db.profileHypeEvent.findMany({
    where: { userId },
    select: {
      profileId: true,
      createdAt: true,
      profile: {
        select: {
          name: true, slug: true, avatarImage: true,
          hypeCount: true, type: true, genres: true, verified: true
        }
      }
    },
    orderBy: { createdAt: 'asc' },
    take: 100
  });

  if (myHypes.length === 0) {
    return (
      <main className="wb-main">
        <div className="wb-content">
          <h1>Artist Growth</h1>
          <div className="empty">
            <span className="empty-title">No hypes yet.</span>
            <p>Hype artists to track how they grow after you discover them.</p>
            <Link href="/discover" className="button">Go to Discover</Link>
          </div>
        </div>
      </main>
    );
  }

  // Get hype count at time of discovery for each artist
  const countAtDiscovery = await Promise.all(
    myHypes.map(h =>
      db.profileHypeEvent.count({
        where: { profileId: h.profileId, createdAt: { lte: h.createdAt } }
      })
    )
  );

  const portfolio = myHypes.map((h, i) => ({
    profileId: h.profileId,
    name: h.profile.name,
    slug: h.profile.slug,
    avatarImage: h.profile.avatarImage,
    type: h.profile.type,
    genres: h.profile.genres,
    verified: h.profile.verified,
    discoveredAt: h.createdAt,
    hypeCountAtDiscovery: countAtDiscovery[i],
    currentHypeCount: h.profile.hypeCount,
    growth: h.profile.hypeCount - countAtDiscovery[i],
    growthPct: countAtDiscovery[i] > 0
      ? Math.round(((h.profile.hypeCount - countAtDiscovery[i]) / countAtDiscovery[i]) * 100)
      : 0
  }));

  // Sort
  const sorted = [...portfolio].sort((a, b) => {
    if (sort === 'growth')     return b.growth - a.growth;
    if (sort === 'discovered') return a.discoveredAt.getTime() - b.discoveredAt.getTime();
    if (sort === 'current')    return b.currentHypeCount - a.currentHypeCount;
    if (sort === 'early')      return a.hypeCountAtDiscovery - b.hypeCountAtDiscovery;
    return 0;
  });

  // Stats
  const totalGrowth = portfolio.reduce((sum, p) => sum + p.growth, 0);
  const avgGrowth = portfolio.length > 0 ? Math.round(totalGrowth / portfolio.length) : 0;
  const bestCall = [...portfolio].sort((a, b) => b.growth - a.growth)[0];
  const earliestFind = [...portfolio].sort((a, b) => a.discoveredAt.getTime() - b.discoveredAt.getTime())[0];
  const earlyFinds = portfolio.filter(p => p.hypeCountAtDiscovery <= 10).length;
  const verified = portfolio.filter(p => p.verified).length;

  const maxGrowth = Math.max(1, ...portfolio.map(p => p.growth));

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Artist Growth</h1>
          <p className="meta">Your artist portfolio — how they've grown since you found them.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Artists backed', value: portfolio.length },
            { label: 'Total growth', value: `+${totalGrowth.toLocaleString()}`, sub: 'hypes across portfolio' },
            { label: 'Avg growth', value: `+${avgGrowth}`, sub: 'per artist' },
            { label: 'Found under 10', value: earlyFinds, sub: 'hypes at discovery' },
            { label: 'Now verified', value: verified },
          ].map(s => (
            <div key={s.label} className="panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.1, color: typeof s.value === 'string' && s.value.startsWith('+') ? 'var(--accent, #ff5029)' : 'inherit' }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Highlight: best call */}
        {bestCall && bestCall.growth > 0 && (
          <div className="panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent, #ff5029)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {bestCall.avatarImage && <img src={bestCall.avatarImage} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: 2 }}>Best call</div>
              <Link href={`/artists/${bestCall.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong style={{ fontSize: '1.1rem' }}>{bestCall.name}</strong>
              </Link>
              <div style={{ fontSize: '0.72rem', opacity: 0.55, marginTop: 2 }}>
                {bestCall.hypeCountAtDiscovery} hypes when you found them ·{' '}
                <span style={{ color: 'var(--accent, #ff5029)', fontWeight: 700 }}>+{bestCall.growth.toLocaleString()}</span>{' '}
                hypes since · now at {bestCall.currentHypeCount.toLocaleString()}
                {bestCall.growthPct > 0 && ` (+${bestCall.growthPct}%)`}
              </div>
            </div>
          </div>
        )}

        {/* Sort controls */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {([['growth', 'Most growth'], ['early', 'Earliest find'], ['current', 'Most popular'], ['discovered', 'Discovery date']] as [SortKey, string][]).map(([key, label]) => (
            <Link key={key} href={`/workbench/growth?sort=${key}`} className={`button small${sort === key ? '' : ' secondary'}`}>{label}</Link>
          ))}
        </div>

        {/* Portfolio list */}
        <div className="panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sorted.map((p, i) => (
              <div key={p.profileId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '0.6rem', opacity: 0.25, width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                {p.avatarImage ? (
                  <img src={p.avatarImage} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Link href={`/artists/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </Link>
                    {p.verified && <span style={{ fontSize: '0.55rem', background: 'var(--accent, #ff5029)', color: '#fff', borderRadius: 3, padding: '1px 4px', flexShrink: 0 }}>✓</span>}
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
                    <div style={{ width: `${(p.growth / maxGrowth) * 100}%`, height: '100%', background: p.growth > 0 ? 'var(--accent, #ff5029)' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: '0.62rem', opacity: 0.4 }}>
                    Found #{p.hypeCountAtDiscovery} · {p.discoveredAt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: p.growth > 0 ? 'var(--accent, #ff5029)' : 'rgba(255,255,255,0.3)' }}>
                    {p.growth > 0 ? `+${p.growth.toLocaleString()}` : '—'}
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>{p.currentHypeCount.toLocaleString()} now</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
