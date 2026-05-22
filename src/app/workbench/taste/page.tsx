import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Taste Profile · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

const ARCHETYPES: { label: string; keywords: string[]; description: string }[] = [
  { label: 'Bass Head',         keywords: ['dubstep','drum and bass','bass','dnb','riddim','neuro','halftime'], description: 'You live for the low end. Sub-bass and breaks are your habitat.' },
  { label: 'House Head',        keywords: ['house','deep house','tech house','afro house','garage','uk garage','disco'], description: 'The groove is sacred. You know every room has a frequency.' },
  { label: 'Techno Devotee',    keywords: ['techno','industrial','acid','ebm','dark techno','detroit techno'], description: 'Four-on-the-floor is a religion. You prefer it dark and relentless.' },
  { label: 'Hip-Hop Curator',   keywords: ['hip hop','hip-hop','rap','trap','boom bap','drill','lo-fi hip hop'], description: "Bar for bar, you know who's got it. You back lyricists and producers." },
  { label: 'Electronic Explorer',keywords: ['electronic','edm','ambient','experimental','idm','downtempo','future bass'], description: 'You range wide. Genre labels bore you — you chase the sound.' },
  { label: 'Indie Discoverer',  keywords: ['indie','alternative','indie pop','dream pop','shoegaze','indie rock'], description: "You hear things before they're on any playlist. Small stages, big ears." },
  { label: 'Crate Digger',      keywords: ['jazz','soul','funk','r&b','blues','neo soul','gospel'], description: 'You respect the source. Everything modern owes something to what you love.' },
  { label: 'Club Architect',    keywords: ['club','dance','party','dj','mix','dance music','edm'], description: 'You think in sets. The dancefloor is the canvas.' },
  { label: 'Scene Builder',     keywords: [], description: "You're not just a listener — you're invested in the ecosystem. Venues, DJs, artists, all of it." },
];

function getArchetype(genreFreqs: [string, number][], typeBreakdown: Map<string, number>): typeof ARCHETYPES[number] {
  const topGenres = new Set(genreFreqs.slice(0, 15).map(([g]) => g.toLowerCase()));
  for (const arch of ARCHETYPES.slice(0, -1)) {
    if (arch.keywords.some(k => topGenres.has(k) || [...topGenres].some(g => g.includes(k)))) {
      return arch;
    }
  }
  // Venue-heavy → Scene Builder
  const venueCount = typeBreakdown.get('VENUE') ?? 0;
  const total = [...typeBreakdown.values()].reduce((a, b) => a + b, 0);
  if (total > 0 && venueCount / total > 0.4) return ARCHETYPES[ARCHETYPES.length - 1];
  return { label: 'Genre Agnostic', keywords: [], description: "You don't let labels limit you. If it hits, it hits." };
}

export default async function TasteProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const [hypes, listens] = await Promise.all([
    db.profileHypeEvent.findMany({
      where: { userId },
      select: { profile: { select: { name: true, slug: true, genres: true, city: true, stateRegion: true, country: true, type: true, avatarImage: true } } }
    }),
    db.mediaListen.findMany({
      where: { userId },
      select: { artistName: true, artistProfileSlug: true }
    })
  ]);

  if (hypes.length === 0 && listens.length === 0) {
    return (
      <main className="wb-main">
        <div className="wb-content">
          <h1>Taste Profile</h1>
          <div className="empty">
            <span className="empty-title">Not enough data yet.</span>
            <p>Hype some artists and complete some tracks to build your profile.</p>
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
  const maxGenre = topGenres[0]?.[1] ?? 1;

  // Scene frequencies (city)
  const sceneCounts = new Map<string, number>();
  for (const h of hypes) {
    const city = h.profile.city?.toLowerCase().trim();
    if (city) sceneCounts.set(city, (sceneCounts.get(city) ?? 0) + 1);
  }
  const topScenes = [...sceneCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Type breakdown
  const typeCounts = new Map<string, number>();
  for (const h of hypes) {
    const t = h.profile.type;
    typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
  }
  const totalTypes = [...typeCounts.values()].reduce((a, b) => a + b, 0);

  // Archetype
  const archetype = getArchetype(topGenres, typeCounts);

  // Top artists
  const topArtists = hypes
    .filter((h, i, arr) => arr.findIndex(x => x.profile.slug === h.profile.slug) === i)
    .slice(0, 6);

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Profile card */}
        <div className="panel" style={{
          padding: '2rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255,80,41,0.15) 0%, rgba(180,40,180,0.1) 100%)',
          borderLeft: '4px solid var(--accent, #ff5029)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 6 }}>Your taste archetype</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{archetype.label}</div>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', maxWidth: 500 }}>{archetype.description}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topGenres.slice(0, 5).map(([g]) => (
              <span key={g} style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, textTransform: 'capitalize' }}>{g}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

          {/* Genre breakdown */}
          {topGenres.length > 0 && (
            <div className="panel" style={{ padding: '1rem 1.25rem' }}>
              <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>Genres</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {topGenres.slice(0, 10).map(([genre, count]) => (
                  <div key={genre}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}>{genre}</span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(count / maxGenre) * 100}%`, height: '100%', background: 'var(--accent, #ff5029)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top scenes */}
          {topScenes.length > 0 && (
            <div className="panel" style={{ padding: '1rem 1.25rem' }}>
              <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>Scenes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {topScenes.map(([city, count], i) => (
                  <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.6rem', opacity: 0.3, width: 12, textAlign: 'right' }}>{i + 1}</span>
                    <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', flex: 1 }}>{city}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.45 }}>{count} artist{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Who you support */}
          {totalTypes > 0 && (
            <div className="panel" style={{ padding: '1rem 1.25rem' }}>
              <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>Who you support</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...typeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.78rem' }}>{type.charAt(0) + type.slice(1).toLowerCase()}{count !== 1 ? 's' : ''}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{Math.round(count / totalTypes * 100)}%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${count / totalTypes * 100}%`, height: '100%', background: 'var(--accent, #ff5029)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', opacity: 0.4 }}>{hypes.length} total hypes · {listens.length} tracks completed</div>
            </div>
          )}
        </div>

        {/* Top artists grid */}
        {topArtists.length > 0 && (
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>Artists you back</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
              {topArtists.map(h => (
                <Link key={h.profile.slug} href={`/artists/${h.profile.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                  {h.profile.avatarImage ? (
                    <img src={h.profile.avatarImage} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent, #ff5029)', opacity: 0.3 }} />
                  )}
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.2 }}>{h.profile.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
