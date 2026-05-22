import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import ReportShareButton from '@/components/ReportShareButton';

export const metadata: Metadata = { title: 'Scene Report Card · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

const ARCHETYPES = [
  { label: 'Bass Head',          keywords: ['dubstep','drum and bass','bass','dnb','riddim','neuro','halftime'] },
  { label: 'House Head',         keywords: ['house','deep house','tech house','afro house','garage','uk garage','disco'] },
  { label: 'Techno Devotee',     keywords: ['techno','industrial','acid','ebm','dark techno','detroit techno'] },
  { label: 'Hip-Hop Curator',    keywords: ['hip hop','hip-hop','rap','trap','boom bap','drill','lo-fi hip hop'] },
  { label: 'Electronic Explorer',keywords: ['electronic','edm','ambient','experimental','idm','downtempo','future bass'] },
  { label: 'Indie Discoverer',   keywords: ['indie','alternative','indie pop','dream pop','shoegaze','indie rock'] },
  { label: 'Crate Digger',       keywords: ['jazz','soul','funk','r&b','blues','neo soul','gospel'] },
];

function getArchetype(topGenres: [string, number][]): string {
  const topSet = new Set(topGenres.slice(0, 15).map(([g]) => g.toLowerCase()));
  for (const arch of ARCHETYPES) {
    if (arch.keywords.some(k => topSet.has(k) || [...topSet].some(g => g.includes(k)))) {
      return arch.label;
    }
  }
  return 'Genre Agnostic';
}

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const hypes = await db.profileHypeEvent.findMany({
    where: { userId },
    select: {
      createdAt: true,
      profile: {
        select: {
          name: true,
          genres: true,
          city: true,
          hypeCount: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (hypes.length === 0) {
    return (
      <main className="wb-main">
        <div className="wb-content" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1>Scene Report Card</h1>
          <div className="empty">
            <span className="empty-title">Nothing to report yet.</span>
            <p>Hype some artists to generate your Scene Report Card.</p>
            <Link href="/discover" className="button">Go to Discover</Link>
          </div>
        </div>
      </main>
    );
  }

  // Genre frequencies
  const genreCounts = new Map<string, number>();
  for (const h of hypes) {
    for (const g of h.profile.genres) {
      const k = g.toLowerCase().trim();
      if (k) genreCounts.set(k, (genreCounts.get(k) ?? 0) + 1);
    }
  }
  const topGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
  const top3Genres = topGenres.slice(0, 3).map(([g]) => g.replace(/\b\w/g, c => c.toUpperCase()));

  // City frequencies
  const cityCounts = new Map<string, number>();
  for (const h of hypes) {
    const city = h.profile.city?.trim();
    if (city) cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
  }
  const topCityEntry = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCity = topCityEntry?.[0] ?? 'Unknown';

  // Archetype
  const archetype = getArchetype(topGenres);

  // Year of first hype
  const firstHypeYear = hypes[0]?.createdAt
    ? new Date(hypes[0].createdAt).getFullYear()
    : null;

  // Total hypes
  const totalHypes = hypes.length;

  // Unique artists
  const uniqueArtistNames = new Set(hypes.map(h => h.profile.name));
  const artistCount = uniqueArtistNames.size;

  // Unique cities
  const uniqueCities = new Set(
    hypes.map(h => h.profile.city?.trim()).filter(Boolean)
  ).size;

  // Most active month
  const monthCounts = new Map<string, number>();
  for (const h of hypes) {
    const d = new Date(h.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const topMonthEntry = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  let mostActiveMonth = '—';
  if (topMonthEntry) {
    const [yr, mo] = topMonthEntry[0].split('-');
    const date = new Date(Number(yr), Number(mo) - 1, 1);
    mostActiveMonth = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  // Rarest find: artist with lowest hypeCount from hyped list
  const withHypeCount = hypes.filter(h => h.profile.hypeCount != null);
  let rarestName = '—';
  if (withHypeCount.length > 0) {
    const rarest = withHypeCount.reduce((min, h) =>
      (h.profile.hypeCount ?? Infinity) < (min.profile.hypeCount ?? Infinity) ? h : min
    );
    rarestName = rarest.profile.name ?? '—';
  }

  const stats = [
    { label: 'Artists Hyped', value: artistCount },
    { label: 'Unique Cities', value: uniqueCities },
    { label: 'Most Active Month', value: mostActiveMonth },
    { label: 'Rarest Find', value: rarestName },
  ];

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Scene Report Card</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Your music taste, at a glance.
        </p>

        {/* The Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20,10,30,0.95) 0%, rgba(40,10,20,0.95) 100%)',
            border: '1px solid rgba(255,80,41,0.3)',
            borderRadius: 12,
            padding: '2rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255,80,41,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Archetype */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ color: 'rgba(255,80,41,0.7)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Your Archetype
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
              {archetype}
            </div>
          </div>

          {/* Top Genres */}
          {top3Genres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {top3Genres.map(genre => (
                <span
                  key={genre}
                  style={{
                    background: 'rgba(255,80,41,0.15)',
                    border: '1px solid rgba(255,80,41,0.35)',
                    color: 'var(--accent, #ff5029)',
                    borderRadius: 20,
                    padding: '0.35rem 0.9rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Top Scene */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Scene</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{topCity}</span>
          </div>

          {/* Hype count + since */}
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent, #ff5029)', lineHeight: 1 }}>{totalHypes}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Total Hypes</div>
            </div>
            {firstHypeYear && (
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>{firstHypeYear}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.2rem' }}>First Hype</div>
              </div>
            )}
          </div>

          {/* Branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Scene Report Card
            </span>
            <span style={{ color: 'var(--accent, #ff5029)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
              ihype.org
            </span>
          </div>
        </div>

        {/* Share button */}
        <div style={{ marginBottom: '2rem' }}>
          <ReportShareButton archetype={archetype} topCity={topCity} artistCount={artistCount} />
        </div>

        {/* Stats Grid */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Breakdown
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '1rem',
              }}
            >
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', wordBreak: 'break-word' }}>
                {stat.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
