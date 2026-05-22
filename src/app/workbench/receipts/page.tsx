import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Hype Receipts · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

function RankBadge({ rank }: { rank: number }) {
  const color = rank === 1 ? '#FFD700' : rank <= 5 ? '#ff5029' : rank <= 20 ? '#ff8c69' : rank <= 50 ? '#c084fc' : 'rgba(255,255,255,0.3)';
  const label = rank === 1 ? '🥇 First' : rank <= 5 ? `Top 5` : rank <= 20 ? `Top 20` : rank <= 50 ? `Top 50` : `#${rank}`;
  return (
    <span style={{ fontSize: '0.62rem', fontWeight: 700, color, border: `1px solid ${color}`, borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
      {label}
    </span>
  );
}

export default async function HypeReceiptsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const myHypes = await db.profileHypeEvent.findMany({
    where: { userId },
    select: {
      profileId: true,
      createdAt: true,
      profile: { select: { name: true, slug: true, avatarImage: true, hypeCount: true, type: true, genres: true } }
    },
    orderBy: { createdAt: 'asc' },
    take: 100
  });

  if (myHypes.length === 0) {
    return (
      <main className="wb-main">
        <div className="wb-content">
          <h1>Hype Receipts</h1>
          <div className="empty">
            <span className="empty-title">No hypes yet.</span>
            <p>Start hyping artists and your receipts will appear here.</p>
            <Link href="/discover" className="button">Go to Discover</Link>
          </div>
        </div>
      </main>
    );
  }

  // For each hype, count how many people hyped before the viewer (their rank = count + 1)
  const rankCounts = await Promise.all(
    myHypes.map(h =>
      db.profileHypeEvent.count({
        where: { profileId: h.profileId, createdAt: { lt: h.createdAt } }
      })
    )
  );

  const receipts = myHypes.map((h, i) => ({
    ...h,
    rank: rankCounts[i] + 1,
    hypeCountAtDiscovery: rankCounts[i] + 1,
    growth: h.profile.hypeCount - (rankCounts[i] + 1)
  }));

  // Stats
  const firstHypes = receipts.filter(r => r.rank === 1).length;
  const top5 = receipts.filter(r => r.rank <= 5).length;
  const top20 = receipts.filter(r => r.rank <= 20).length;
  const biggestGrowth = [...receipts].sort((a, b) => b.growth - a.growth)[0];
  const earliestFind = receipts[0];

  const sortedByRank = [...receipts].sort((a, b) => a.rank - b.rank);

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Hype Receipts</h1>
          <p className="meta">Your rank among all hypers for every artist you've supported.</p>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Artists hyped', value: receipts.length },
            { label: 'First to hype', value: firstHypes },
            { label: 'Top 5 early', value: top5 },
            { label: 'Top 20 early', value: top20 },
          ].map(s => (
            <div key={s.label} className="panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4 }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Highlight cards */}
        {(biggestGrowth || earliestFind) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {biggestGrowth && biggestGrowth.growth > 0 && (
              <div className="panel" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid var(--accent, #ff5029)' }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: 6 }}>Best call</div>
                <Link href={`/artists/${biggestGrowth.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{biggestGrowth.profile.name}</div>
                </Link>
                <div style={{ fontSize: '0.72rem', opacity: 0.55, marginTop: 2 }}>
                  You were #{biggestGrowth.rank} · now at {biggestGrowth.profile.hypeCount.toLocaleString()} hypes
                  <span style={{ color: 'var(--accent, #ff5029)', fontWeight: 700, marginLeft: 4 }}>+{biggestGrowth.growth.toLocaleString()}</span>
                </div>
              </div>
            )}
            {earliestFind && (
              <div className="panel" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid #c084fc' }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: 6 }}>First discovery</div>
                <Link href={`/artists/${earliestFind.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{earliestFind.profile.name}</div>
                </Link>
                <div style={{ fontSize: '0.72rem', opacity: 0.55, marginTop: 2 }}>
                  {earliestFind.createdAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} · #{earliestFind.rank} to hype
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full receipts list */}
        <div className="panel" style={{ padding: '1rem 1.25rem' }}>
          <h2 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
            All receipts — sorted by rank
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sortedByRank.map((r, i) => (
              <div key={r.profileId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < sortedByRank.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {r.profile.avatarImage ? (
                  <img src={r.profile.avatarImage} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/artists/${r.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.profile.name}</div>
                  </Link>
                  <div style={{ fontSize: '0.66rem', opacity: 0.45 }}>
                    {r.hypeCountAtDiscovery} hypes when found · {r.profile.hypeCount.toLocaleString()} now
                    {r.growth > 0 && <span style={{ color: 'var(--accent, #ff5029)', marginLeft: 4 }}>+{r.growth.toLocaleString()}</span>}
                  </div>
                </div>
                <RankBadge rank={r.rank} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
