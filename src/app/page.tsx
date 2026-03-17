import Link from 'next/link';
import { getHomePageData } from '@/lib/public-data';

export const revalidate = 60;

export default async function HomePage() {
  const { featuredShows, transparencySnapshot } = await getHomePageData();
  const counters = transparencySnapshot.counters;

  const featuredMoments = featuredShows.slice(0, 3).map((show) => ({
    slug: show.slug,
    title: show.title,
    venue: show.venueProfile?.name ?? 'Venue coming online',
    detail:
      show.headlinerProfile?.name ??
      show.description ??
      'Live rooms, artist pages, and promoter-led nights are moving through iHYPE.'
  }));

  return (
    <main className="container section home-shell">
      <section className="home-mission-grid" aria-label="About iHYPE">
        <div className="home-mission-panel">
          <div className="badge">ABOUT IHYPE</div>
          <h1 className="home-mission-title">
            iHYPE helps fans discover, follow, and hype the artists, promoters, and venues shaping the
            next scene.
          </h1>
          <p className="home-mission-copy">
            The platform is built around live music discovery. Fans can browse pages, track what is moving in
            nearby markets, and support the people and places building culture. Artists, promoters, and venues
            each get their own discover lane once they sign in, but the homepage stays focused on what iHYPE
            is and why it exists.
          </p>
          <div className="cta-row">
            <Link className="button" href="/register">
              Join iHYPE
            </Link>
            <Link className="button secondary" href="/login">
              Sign in
            </Link>
          </div>
          <div className="home-signal-strip home-signal-strip-dark" aria-label="Network overview">
            <div className="home-signal-item home-signal-item-dark">
              <span>Fans</span>
              <strong>{counters.totalListeners}</strong>
            </div>
            <div className="home-signal-item home-signal-item-dark">
              <span>Artists</span>
              <strong>{counters.totalArtists}</strong>
            </div>
            <div className="home-signal-item home-signal-item-dark">
              <span>Promoters</span>
              <strong>{counters.totalPromoters}</strong>
            </div>
            <div className="home-signal-item home-signal-item-dark">
              <span>Venues</span>
              <strong>{counters.totalVenues}</strong>
            </div>
          </div>
        </div>

        <aside className="home-featured-panel" aria-label="What iHYPE does">
          <div className="home-featured-head">
            <div>
              <div className="badge">CORE LOOP</div>
              <h2>What happens here</h2>
            </div>
          </div>
          <div className="home-featured-list">
            <div className="home-featured-card">
              <strong>Fans find the next room</strong>
              <p className="meta">
                Browse artists, promoters, and venues in one network and move from discovery to attendance.
              </p>
            </div>
            <div className="home-featured-card">
              <strong>Hype turns attention into signal</strong>
              <p className="meta">
                Pages and shows earn visible momentum through fan activity instead of hidden black-box ranking.
              </p>
            </div>
            <div className="home-featured-card">
              <strong>Creators get the right lane</strong>
              <p className="meta">
                Artists, promoters, and venues each land in a discover space with tools matched to their role.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="home-browse-grid" aria-label="How to explore iHYPE">
        <div className="home-browse-panel panel">
          <div className="home-featured-head">
            <div>
              <div className="badge">DISCOVER LANES</div>
              <h2>Explore the network</h2>
            </div>
          </div>
          <div className="home-browse-card-grid">
            <Link className="home-browse-card" href="/fans">
              <strong>Fans</strong>
              <p className="meta">Build identity, discover shows, and track who you are hyping.</p>
            </Link>
            <Link className="home-browse-card" href="/artists">
              <strong>Artists</strong>
              <p className="meta">Show music, upcoming dates, merch, and what direction the project is taking.</p>
            </Link>
            <Link className="home-browse-card" href="/promoters">
              <strong>Promoters</strong>
              <p className="meta">Build nights, record shows, and connect audience energy to live programming.</p>
            </Link>
            <Link className="home-browse-card" href="/venues">
              <strong>Venues</strong>
              <p className="meta">Show the room, the hours, the calendar, and the artists worth bringing through.</p>
            </Link>
          </div>
        </div>

        <div className="home-transparency-panel panel" aria-label="Network activity">
          <div className="home-featured-head">
            <div>
              <div className="badge">LIVE SIGNAL</div>
              <h2>Scene activity now</h2>
            </div>
          </div>
          <div className="home-heuristics-list">
            <div className="home-heuristic-card">
              <strong>{counters.totalShows}</strong>
              <p className="meta">Shows tracked across the network.</p>
            </div>
            <div className="home-heuristic-card">
              <strong>{counters.liveShows + counters.upcomingShows}</strong>
              <p className="meta">Live or upcoming sets fans can move toward right now.</p>
            </div>
            <div className="home-heuristic-card">
              <strong>{counters.totalTicketsSold}</strong>
              <p className="meta">Tickets issued through the serialized iHYPE ticket flow.</p>
            </div>
            <div className="home-heuristic-card">
              <strong>{counters.totalSongsUploaded}</strong>
              <p className="meta">Tracks uploaded by artists and promoters inside the network.</p>
            </div>
          </div>
        </div>
      </section>

      {featuredMoments.length ? (
        <section className="section" aria-label="Featured activity">
          <div className="home-featured-panel">
            <div className="home-featured-head">
              <div>
                <div className="badge">ON DECK</div>
                <h2>What is moving through iHYPE</h2>
              </div>
            </div>
            <div className="home-featured-list">
              {featuredMoments.map((moment) => (
                <Link className="home-featured-card" href={`/shows/${moment.slug}`} key={moment.slug}>
                  <strong>{moment.title}</strong>
                  <span>{moment.venue}</span>
                  <p className="meta">{moment.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
