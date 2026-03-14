import { ShowCard } from '@/components/ShowCard';
import { getShowsDirectoryData } from '@/lib/public-data';
import { sortShowsForFeed } from '@/lib/integrity';

export const dynamic = 'force-dynamic';

export default async function ShowsIndexPage() {
  const shows = sortShowsForFeed(await getShowsDirectoryData());
  const now = new Date();
  const liveShows = shows.filter((show) => show.status === 'LIVE');
  const upcomingShows = shows.filter((show) => show.status !== 'LIVE' && show.startsAt >= now);
  const recentShows = shows.filter((show) => show.status === 'ENDED' || (show.startsAt < now && show.status !== 'LIVE')).slice(0, 6);

  return (
    <main className="container section">
      <section className="directory-hero panel">
        <div className="directory-hero-copy">
          <div className="badge">SHOWS</div>
          <h1 className="directory-title">Live, upcoming, and recently archived broadcasts in one place.</h1>
          <p className="subtitle">
            Shows are the front door to the product. Live broadcasts surface first, then scheduled rooms close behind,
            with recent archives still visible long enough to help discovery.
          </p>
        </div>

        <div className="directory-hero-stats">
          <div className="directory-stat">
            <span>Live</span>
            <strong>{liveShows.length}</strong>
          </div>
          <div className="directory-stat">
            <span>Upcoming</span>
            <strong>{upcomingShows.length}</strong>
          </div>
          <div className="directory-stat">
            <span>Recent archives</span>
            <strong>{recentShows.length}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="directory-section-head">
          <h2>Live now</h2>
        </div>
        <div className="grid grid-2">
          {liveShows.length ? liveShows.map((show) => <ShowCard key={show.id} show={show} />) : <div className="empty">No live broadcasts right now.</div>}
        </div>
      </section>

      <section className="section">
        <div className="directory-section-head">
          <h2>Upcoming</h2>
        </div>
        <div className="grid grid-2">
          {upcomingShows.length ? upcomingShows.map((show) => <ShowCard key={show.id} show={show} />) : <div className="empty">No scheduled shows yet.</div>}
        </div>
      </section>

      <section className="section">
        <div className="directory-section-head">
          <h2>Recent archives</h2>
        </div>
        <div className="grid grid-2">
          {recentShows.length ? recentShows.map((show) => <ShowCard key={show.id} show={show} />) : <div className="empty">No recent archives yet.</div>}
        </div>
      </section>
    </main>
  );
}
