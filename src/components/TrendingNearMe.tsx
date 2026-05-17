import Link from 'next/link';
import { db } from '@/lib/db';

type Props = {
  viewerCity: string | null;
};

export async function TrendingNearMe({ viewerCity }: Props) {
  if (!viewerCity) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const hypeGroups = await db.profileHypeEvent.groupBy({
    by: ['profileId'],
    where: { createdAt: { gte: sevenDaysAgo } },
    _count: { profileId: true },
    orderBy: { _count: { profileId: 'desc' } },
    take: 20
  });

  const profileIds = hypeGroups.map((g) => g.profileId);
  if (profileIds.length === 0) return null;

  const profiles = await db.profile.findMany({
    where: {
      id: { in: profileIds },
      city: { contains: viewerCity, mode: 'insensitive' }
    },
    select: { id: true, name: true, slug: true, type: true, city: true, genre: true },
    take: 4
  });

  if (profiles.length === 0) return null;

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 18, marginBottom: 12, color: 'var(--ink)' }}>
        Trending in {viewerCity}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {profiles.map((p) => {
          const href = p.type === 'VENUE' ? `/venues/${p.slug}` : p.type === 'DJ' ? `/promoters/${p.slug}` : `/artists/${p.slug}`;
          const hypeCount = hypeGroups.find((g) => g.profileId === p.id)?._count.profileId ?? 0;
          return (
            <Link
              key={p.id}
              href={href}
              style={{
                display: 'block',
                padding: '14px 16px',
                borderRadius: 10,
                background: 'var(--bg-2)',
                border: '1px solid var(--line)',
                textDecoration: 'none'
              }}
            >
              <p style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', margin: 0 }}>{p.name}</p>
              {p.genre ? <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', margin: '2px 0 0' }}>{p.genre}</p> : null}
              <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--accent)', margin: '4px 0 0' }}>{hypeCount} hype this week</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
