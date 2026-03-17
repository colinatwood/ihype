import Link from 'next/link';
import { getHomePageData } from '@/lib/public-data';

export const revalidate = 60;

export default async function HomePage() {
  const { transparencySnapshot } = await getHomePageData();
  const counters = transparencySnapshot.counters;

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
    </main>
  );
}
