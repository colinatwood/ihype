import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Search · iHYPE' };
export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const q = typeof resolved.q === 'string' ? resolved.q.trim() : '';

  if (!q) {
    return (
      <main className="container section" style={{ maxWidth: 700 }}>
        <h1 className="title">Search</h1>
        <form action="/search" method="get">
          <input name="q" className="input" placeholder="Search artists, shows…" autoFocus style={{ maxWidth: 400 }} />
          <button className="button" type="submit" style={{ marginLeft: 8 }}>Search</button>
        </form>
      </main>
    );
  }

  const [profiles, shows] = await Promise.all([
    db.profile.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } }
        ],
        type: { in: ['ARTIST', 'VENUE', 'DJ'] }
      },
      take: 10,
      orderBy: { hypeCount: 'desc' },
      select: { id: true, slug: true, name: true, type: true, bio: true, city: true, stateRegion: true, hypeCount: true }
    }),
    db.show.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      take: 10,
      orderBy: { startsAt: 'asc' },
      select: {
        id: true, slug: true, title: true, status: true, startsAt: true,
        venueProfile: { select: { name: true, city: true } }
      }
    })
  ]);

  const artists = profiles.filter((p) => p.type === 'ARTIST');
  const venues = profiles.filter((p) => p.type === 'VENUE');
  const djs = profiles.filter((p) => p.type === 'DJ');

  return (
    <main className="container section" style={{ maxWidth: 700 }}>
      <h1 className="title">Search results for &ldquo;{q}&rdquo;</h1>
      <form action="/search" method="get" style={{ marginBottom: 24 }}>
        <input name="q" className="input" defaultValue={q} style={{ maxWidth: 400 }} />
        <button className="button" type="submit" style={{ marginLeft: 8 }}>Search</button>
      </form>

      {artists.length > 0 && (
        <section className="section">
          <h2>Artists</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {artists.map((p) => (
              <li key={p.id} className="panel" style={{ padding: '0.75rem 1rem' }}>
                <Link href={`/artists/${p.slug}`} style={{ fontWeight: 700 }}>{p.name}</Link>
                <span className="meta" style={{ marginLeft: 8 }}>
                  {[p.city, p.stateRegion].filter(Boolean).join(', ')}
                  {p.hypeCount ? ` · ${p.hypeCount} HYPE` : ''}
                </span>
                {p.bio && <p className="meta" style={{ marginTop: 4 }}>{p.bio.slice(0, 120)}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {djs.length > 0 && (
        <section className="section">
          <h2>DJs</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {djs.map((p) => (
              <li key={p.id} className="panel" style={{ padding: '0.75rem 1rem' }}>
                <Link href={`/artists/${p.slug}`} style={{ fontWeight: 700 }}>{p.name}</Link>
                <span className="meta" style={{ marginLeft: 8 }}>
                  {[p.city, p.stateRegion].filter(Boolean).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {venues.length > 0 && (
        <section className="section">
          <h2>Venues</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {venues.map((p) => (
              <li key={p.id} className="panel" style={{ padding: '0.75rem 1rem' }}>
                <Link href={`/artists/${p.slug}`} style={{ fontWeight: 700 }}>{p.name}</Link>
                <span className="meta" style={{ marginLeft: 8 }}>
                  {[p.city, p.stateRegion].filter(Boolean).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shows.length > 0 && (
        <section className="section">
          <h2>Shows</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {shows.map((s) => (
              <li key={s.id} className="panel" style={{ padding: '0.75rem 1rem' }}>
                <Link href={`/shows/${s.slug}`} style={{ fontWeight: 700 }}>{s.title}</Link>
                <span className="meta" style={{ marginLeft: 8 }}>
                  {s.status}
                  {s.venueProfile?.name ? ` · ${s.venueProfile.name}` : ''}
                  {s.venueProfile?.city ? ` · ${s.venueProfile.city}` : ''}
                  {s.startsAt
                    ? ` · ${new Date(s.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profiles.length === 0 && shows.length === 0 && (
        <p className="meta">No results found for &ldquo;{q}&rdquo;.</p>
      )}
    </main>
  );
}
