import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Venue DNA · iHYPE Workbench' };
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<Record<string, string>>;
};

const ARCHETYPES: { label: string; keywords: string[]; description: string }[] = [
  { label: 'Bass Cathedral',      keywords: ['dubstep', 'drum and bass', 'bass', 'dnb', 'riddim', 'neuro', 'halftime'], description: 'Sub-frequencies rule. The walls shake on purpose here.' },
  { label: 'House Temple',        keywords: ['house', 'deep house', 'tech house', 'afro house', 'garage', 'uk garage', 'disco'], description: 'The groove never stops. Every night is a ceremony.' },
  { label: 'Techno Bunker',       keywords: ['techno', 'industrial', 'acid', 'ebm', 'dark techno', 'detroit techno'], description: 'Dark, relentless, and uncompromising. Four-four forever.' },
  { label: 'Hip-Hop Citadel',    keywords: ['hip hop', 'hip-hop', 'rap', 'trap', 'boom bap', 'drill', 'lo-fi hip hop'], description: 'Bars matter here. The crowd knows every word.' },
  { label: 'Electronic Frontier', keywords: ['electronic', 'edm', 'ambient', 'experimental', 'idm', 'downtempo', 'future bass'], description: 'Genre-fluid and forward-thinking. Anything can happen.' },
  { label: 'Indie Stronghold',   keywords: ['indie', 'alternative', 'indie pop', 'dream pop', 'shoegaze', 'indie rock'], description: 'Small stages, devoted crowds, breakout moments.' },
  { label: 'Soul Room',          keywords: ['jazz', 'soul', 'funk', 'r&b', 'blues', 'neo soul', 'gospel'], description: 'Roots run deep. Musicianship is non-negotiable.' },
  { label: 'Club Landmark',      keywords: ['club', 'dance', 'party', 'dj', 'mix', 'dance music'], description: 'Purpose-built for the dancefloor. Reputation precedes it.' },
];

function getVibeLabel(genres: [string, number][]): typeof ARCHETYPES[number] {
  const topGenres = new Set(genres.slice(0, 12).map(([g]) => g.toLowerCase()));
  for (const arch of ARCHETYPES) {
    if (arch.keywords.some(k => topGenres.has(k) || [...topGenres].some(g => g.includes(k)))) {
      return arch;
    }
  }
  return { label: 'Multi-Genre Hub', keywords: [], description: 'A venue without a fixed identity — which means anything goes.' };
}

export default async function VenueDnaPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/landing');
  const userId = session.user.id;

  const sp = await searchParams;
  const venueSlug = sp.venue?.trim() || null;

  // Venues the user has hyped
  const hypedVenueHypes = await db.profileHypeEvent.findMany({
    where: { userId, profile: { type: 'VENUE' } },
    select: { profile: { select: { id: true, name: true, slug: true, city: true } } },
  });
  // Deduplicate
  const seenIds = new Set<string>();
  const hypedVenues = hypedVenueHypes.reduce<{ id: string; name: string; slug: string; city: string | null }[]>((acc, h) => {
    if (!seenIds.has(h.profile.id)) {
      seenIds.add(h.profile.id);
      acc.push(h.profile);
    }
    return acc;
  }, []);

  // Resolve selected venue
  let selectedVenue: { id: string; name: string; slug: string; city: string | null } | null = null;
  if (venueSlug) {
    const found = hypedVenues.find(v => v.slug === venueSlug);
    if (found) {
      selectedVenue = found;
    } else {
      // Allow any valid venue slug, not just hyped ones
      const raw = await db.profile.findUnique({
        where: { slug: venueSlug },
        select: { id: true, name: true, slug: true, city: true, type: true },
      });
      if (raw && raw.type === 'VENUE') {
        selectedVenue = { id: raw.id, name: raw.name, slug: raw.slug, city: raw.city };
      }
    }
  }

  // Fetch shows for selected venue
  type ShowRow = {
    id: string;
    title: string;
    startsAt: Date;
    status: string;
    headlinerProfile: {
      name: string;
      slug: string;
      genres: string[];
      hypeCount: number;
      avatarImage: string | null;
    } | null;
  };
  let shows: ShowRow[] = [];
  if (selectedVenue) {
    shows = await db.show.findMany({
      where: { venueProfileId: selectedVenue.id },
      select: {
        id: true,
        title: true,
        startsAt: true,
        status: true,
        headlinerProfile: {
          select: { name: true, slug: true, genres: true, hypeCount: true, avatarImage: true },
        },
      },
      orderBy: { startsAt: 'desc' },
      take: 50,
    }) as ShowRow[];
  }

  // Compute DNA from shows
  const now = new Date();
  const pastShows = shows.filter(s => s.startsAt < now);
  const upcomingShows = shows.filter(s => s.startsAt >= now);

  // Genre frequencies from headliner genres
  const genreCounts = new Map<string, number>();
  for (const show of shows) {
    if (!show.headlinerProfile) continue;
    for (const g of show.headlinerProfile.genres) {
      const k = g.toLowerCase().trim();
      if (k) genreCounts.set(k, (genreCounts.get(k) ?? 0) + 1);
    }
  }
  const topGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
  const maxGenreCount = topGenres[0]?.[1] ?? 1;

  // Top artists (unique headliners, sorted by hypeCount)
  const artistMap = new Map<string, { name: string; slug: string; avatarImage: string | null; hypeCount: number; showCount: number }>();
  for (const show of shows) {
    if (!show.headlinerProfile) continue;
    const { slug, name, avatarImage, hypeCount } = show.headlinerProfile;
    const existing = artistMap.get(slug);
    if (existing) {
      existing.showCount += 1;
    } else {
      artistMap.set(slug, { slug, name, avatarImage, hypeCount, showCount: 1 });
    }
  }
  const topArtists = [...artistMap.values()]
    .sort((a, b) => b.showCount - a.showCount || b.hypeCount - a.hypeCount)
    .slice(0, 12);

  // Peak activity: count shows per year-month
  const monthCounts = new Map<string, number>();
  for (const show of shows) {
    const key = `${show.startsAt.getFullYear()}-${String(show.startsAt.getMonth() + 1).padStart(2, '0')}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const peakEntry = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const peakYearCounts = new Map<string, number>();
  for (const show of shows) {
    const yr = String(show.startsAt.getFullYear());
    peakYearCounts.set(yr, (peakYearCounts.get(yr) ?? 0) + 1);
  }
  const peakYear = [...peakYearCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const vibe = selectedVenue && topGenres.length > 0 ? getVibeLabel(topGenres) : null;

  return (
    <main className="wb-main">
      <div className="wb-content" style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, marginBottom: 4, fontSize: '1.4rem', fontWeight: 900 }}>Venue DNA</h1>
          <p style={{ margin: 0, opacity: 0.5, fontSize: '0.85rem' }}>
            Explore the genre fingerprint and artist history of any venue.
          </p>
        </div>

        {/* Venue picker */}
        <div className="panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
            Select a venue
          </h2>

          {hypedVenues.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
              {hypedVenues.map(v => (
                <Link
                  key={v.slug}
                  href={`/workbench/venue-dna?venue=${v.slug}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: selectedVenue?.slug === v.slug ? 'var(--accent, #ff5029)' : 'rgba(255,255,255,0.08)',
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: selectedVenue?.slug === v.slug ? 700 : 400,
                    border: '1px solid transparent',
                  }}
                >
                  {v.name}{v.city ? ` · ${v.city}` : ''}
                </Link>
              ))}
            </div>
          )}

          <form method="GET" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name="venue"
              defaultValue={venueSlug ?? ''}
              placeholder="Enter venue slug…"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: '0.82rem',
                color: 'inherit',
                flex: 1,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--accent, #ff5029)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go
            </button>
          </form>
        </div>

        {/* No venue found warning */}
        {venueSlug && !selectedVenue && (
          <div className="panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', borderLeft: '3px solid #f59e0b' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>
              No venue found for slug <strong>&quot;{venueSlug}&quot;</strong>. Try one from your hyped list above.
            </p>
          </div>
        )}

        {/* DNA breakdown */}
        {selectedVenue && (
          <>
            {/* Vibe header */}
            <div className="panel" style={{
              padding: '1.5rem 2rem',
              marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, rgba(255,80,41,0.15) 0%, rgba(100,40,200,0.12) 100%)',
              borderLeft: '4px solid var(--accent, #ff5029)',
            }}>
              <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: 6 }}>
                {selectedVenue.city ? `${selectedVenue.name} · ${selectedVenue.city}` : selectedVenue.name}
              </div>
              {vibe ? (
                <>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{vibe.label}</div>
                  <p style={{ margin: 0, opacity: 0.7, fontSize: '0.88rem', maxWidth: 500 }}>{vibe.description}</p>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {topGenres.slice(0, 5).map(([g]) => (
                      <span key={g} style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, textTransform: 'capitalize' }}>{g}</span>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '1.2rem', fontWeight: 700, opacity: 0.5 }}>
                  {shows.length === 0 ? 'No show data yet' : 'No genre data available'}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4, marginBottom: 4 }}>Total shows</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{shows.length}</div>
              </div>
              <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4, marginBottom: 4 }}>Past</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{pastShows.length}</div>
              </div>
              <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4, marginBottom: 4 }}>Upcoming</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1, color: upcomingShows.length > 0 ? 'var(--accent, #ff5029)' : undefined }}>{upcomingShows.length}</div>
              </div>
              <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4, marginBottom: 4 }}>Unique artists</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{artistMap.size}</div>
              </div>
              {peakYear && (
                <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
                  <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4, marginBottom: 4 }}>Peak year</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{peakYear[0]}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: 2 }}>{peakYear[1]} shows</div>
                </div>
              )}
              {peakEntry && (
                <div className="panel" style={{ padding: '0.9rem 1.1rem' }}>
                  <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4, marginBottom: 4 }}>Peak month</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>{peakEntry[0]}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: 2 }}>{peakEntry[1]} shows</div>
                </div>
              )}
            </div>

            {/* Genre + Artists row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {topGenres.length > 0 && (
                <div className="panel" style={{ padding: '1rem 1.25rem' }}>
                  <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>Genre breakdown</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {topGenres.slice(0, 12).map(([genre, count]) => (
                      <div key={genre}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}>{genre}</span>
                          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{count}</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(count / maxGenreCount) * 100}%`, height: '100%', background: 'var(--accent, #ff5029)', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent shows */}
              {shows.length > 0 && (
                <div className="panel" style={{ padding: '1rem 1.25rem' }}>
                  <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>Recent shows</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {shows.slice(0, 10).map(show => (
                      <div key={show.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ minWidth: 48, fontSize: '0.62rem', opacity: 0.4, lineHeight: 1.2 }}>
                          {show.startsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{show.title}</div>
                          {show.headlinerProfile && (
                            <div style={{ fontSize: '0.65rem', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {show.headlinerProfile.name}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.55rem',
                          padding: '2px 6px',
                          borderRadius: 10,
                          background: show.startsAt >= now ? 'rgba(255,80,41,0.2)' : 'rgba(255,255,255,0.06)',
                          color: show.startsAt >= now ? 'var(--accent, #ff5029)' : undefined,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          whiteSpace: 'nowrap',
                        }}>
                          {show.startsAt >= now ? 'upcoming' : 'past'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top artists grid */}
            {topArtists.length > 0 && (
              <div className="panel" style={{ padding: '1rem 1.25rem' }}>
                <h2 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginTop: 0, marginBottom: '0.75rem' }}>
                  Artists who&apos;ve performed here
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                  {topArtists.map(artist => (
                    <Link
                      key={artist.slug}
                      href={`/artists/${artist.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}
                    >
                      {artist.avatarImage ? (
                        <img src={artist.avatarImage} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent, #ff5029)', opacity: 0.25 }} />
                      )}
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, lineHeight: 1.2 }}>{artist.name}</div>
                      {artist.showCount > 1 && (
                        <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: -2 }}>{artist.showCount}×</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {shows.length === 0 && (
              <div className="panel" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ margin: 0 }}>No shows found for this venue yet.</p>
              </div>
            )}
          </>
        )}

        {/* No venue selected & no hyped venues */}
        {!venueSlug && hypedVenues.length === 0 && (
          <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>
              You haven&apos;t hyped any venues yet. Enter a venue slug above, or{' '}
              <Link href="/discover" style={{ color: 'var(--accent, #ff5029)' }}>discover venues</Link>.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
