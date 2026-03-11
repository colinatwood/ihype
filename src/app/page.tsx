import Link from 'next/link';
import { ActivityMap } from '@/components/ActivityMap';
import { ProfileCard } from '@/components/ProfileCard';
import { ShowCard } from '@/components/ShowCard';
import { db, withDbRetry } from '@/lib/db';
import { buildActivityMapPoints, buildActivityScopeCards } from '@/lib/activity-stats';
import { FEED_HEURISTICS_VERSION, sortShowsForFeed } from '@/lib/integrity';
import { getTransparencySnapshot } from '@/lib/transparency';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [[allShows, allProfiles, allRequests], transparencySnapshot] = await Promise.all([
    withDbRetry(() =>
      db.$transaction([
        db.show.findMany({
          where: { status: { not: 'CANCELED' } },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            status: true,
            startsAt: true,
            hypeCount: true,
            isTicketed: true,
            ticketPriceCents: true,
            ticketCapacity: true,
            ticketsSoldCount: true,
            tags: true,
            venueProfile: {
              select: {
                name: true,
                city: true,
                stateRegion: true,
                country: true,
                postalCode: true,
                latitude: true,
                longitude: true
              }
            },
            headlinerProfile: {
              select: {
                name: true,
                city: true,
                country: true
              }
            }
          }
        }),
        db.profile.findMany({
          orderBy: [{ verified: 'desc' }, { name: 'asc' }],
          select: {
            id: true,
            type: true,
            slug: true,
            name: true,
            city: true,
            stateRegion: true,
            country: true,
            postalCode: true,
            latitude: true,
            longitude: true,
            hypeCount: true,
            bio: true,
            genres: true,
            avatarImage: true
          }
        }),
        db.venueConnectionRequest.findMany({
          select: {
            venueProfile: {
              select: {
                city: true,
                country: true
              }
            },
            artistProfile: {
              select: {
                city: true,
                country: true
              }
            }
          }
        })
      ])
    ),
    getTransparencySnapshot()
  ]);

  const profiles = allProfiles.slice(0, 6);
  const shows = sortShowsForFeed(allShows).slice(0, 6);
  const featured = shows[0] ?? null;
  const activityScopes = buildActivityScopeCards({
    profiles: allProfiles,
    shows: allShows,
    requests: allRequests
  });
  const activityPoints = buildActivityMapPoints({
    profiles: allProfiles,
    shows: allShows
  });
  const hotspots = activityPoints.slice(0, 4);

  const signalStripItems = [
    { label: 'Live now', value: `${transparencySnapshot.counters.liveShows} shows on air` },
    { label: 'Listeners', value: `${transparencySnapshot.counters.listenersLiveNow} active right now` },
    { label: 'Tickets', value: `${transparencySnapshot.counters.totalTicketsSold} sold network-wide` },
    { label: 'Heuristics', value: `v${FEED_HEURISTICS_VERSION}` }
  ];

  const statCards = [
    { label: 'Total listeners', value: transparencySnapshot.counters.totalListeners },
    { label: 'Total venues', value: transparencySnapshot.counters.totalVenues },
    { label: 'Total artists', value: transparencySnapshot.counters.totalArtists },
    { label: 'Total promoters', value: transparencySnapshot.counters.totalPromoters },
    { label: 'Events held', value: transparencySnapshot.counters.totalEventsHeld },
    { label: 'Tickets sold', value: transparencySnapshot.counters.totalTicketsSold },
    { label: 'Songs uploaded', value: transparencySnapshot.counters.totalSongsUploaded },
    { label: 'Venue requests', value: transparencySnapshot.counters.totalRequests }
  ];

  const strategyCards = [
    {
      title: 'Chicago Pilot',
      copy: 'Built around Chicago rooms first, with a Midwest expansion path and global visibility already baked into the data model.'
    },
    {
      title: 'Trust Stack',
      copy: 'Playback verification, hype gating, MFA, and visible heuristics keep the product legible instead of mysterious.'
    },
    {
      title: 'Zero Commission',
      copy: 'Ticketing math is explicit: venue and artist split the take, while the promoter pool stays fixed at 5% per ticket sold.'
    }
  ];

  return (
    <main className="container home-shell">
      <section className="home-topline">
        <div className="home-topline-copy">
          <span className="home-eyebrow">Chicago-born live discovery with transparent momentum.</span>
          <span className="home-topline-meta">Feed heuristics v{FEED_HEURISTICS_VERSION}</span>
        </div>
      </section>

      <section className="home-pill-section">
        <div className="home-pill-hero">
          <div className="home-pill-copy">
            <div className="badge home-badge-ink">Live music signal</div>
            <h1 className="home-pill-title">A cleaner front page for rooms, artists, venues, and the cities moving first.</h1>
            <p className="home-pill-subtitle">
              The homepage now follows your sketch: one oversized capsule, one thin signal bar, and two rounded lenses
              for geography and stats. Underneath that, the app still keeps the real network data, ticketing, and
              transparency machinery running.
            </p>
            <div className="cta-row">
              <Link href={featured ? `/shows/${featured.slug}` : '/artists'} className="button">
                {featured ? 'Watch featured signal' : 'Explore artists'}
              </Link>
              <Link href="#activity-map" className="button secondary">
                Open geo map
              </Link>
              <Link href="/integrity" className="button secondary">
                Read heuristics
              </Link>
            </div>
          </div>

          <aside className="home-pill-feature">
            <div className="home-feature-chip">{featured?.status ?? 'Network live'}</div>
            <h2>{featured?.title ?? 'Featured signal loading'}</h2>
            <p className="meta">
              {featured?.venueProfile?.name ?? 'Network venue'}
              {featured?.headlinerProfile?.name ? ` | ${featured.headlinerProfile.name}` : ''}
            </p>
            <p>
              {featured?.description ??
                'Live and upcoming signals are still the core of the experience, just arranged in a sharper shell.'}
            </p>
            <div className="home-pill-metrics">
              <div className="home-metric-pill">
                <strong>{shows.length}</strong>
                Featured shows
              </div>
              <div className="home-metric-pill">
                <strong>{profiles.length}</strong>
                Active profiles
              </div>
              <div className="home-metric-pill">
                <strong>{transparencySnapshot.counters.liveShows}</strong>
                Live broadcasts
              </div>
            </div>
          </aside>
        </div>

        <div className="home-signal-strip">
          {signalStripItems.map((item) => (
            <div className="home-signal-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="home-lens-grid">
        <article className="home-wire-card home-geo-card">
          <div className="home-card-header">
            <div>
              <div className="home-card-label">Geo</div>
              <h2>Where the rooms are heating up.</h2>
            </div>
            <Link href="#activity-map" className="home-inline-link">
              Jump to map
            </Link>
          </div>

          <div className="home-scope-stack">
            {activityScopes.map((scope) => (
              <div className="home-scope-row" key={scope.key}>
                <div>
                  <strong>{scope.label}</strong>
                  <span>{scope.footprint}</span>
                </div>
                <div className="home-scope-values">
                  <span>{scope.profiles} profiles</span>
                  <span>{scope.activeShows} live + upcoming</span>
                </div>
              </div>
            ))}
          </div>

          <div className="home-hotspot-block">
            <h3>Top hotspots</h3>
            <div className="home-hotspot-list">
              {hotspots.map((point) => (
                <div className="home-hotspot" key={point.id}>
                  <div className="home-hotspot-code">{point.postalCode}</div>
                  <div>
                    <strong>
                      {point.city}
                      {point.stateRegion ? `, ${point.stateRegion}` : ''}
                    </strong>
                    <p className="meta">{point.venueCount} venues | {point.showCount} shows | {point.liveCount} live</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="home-wire-card home-stats-card">
          <div className="home-card-header">
            <div>
              <div className="home-card-label">Stats</div>
              <h2>Transparent network counts, surfaced up front.</h2>
            </div>
            <Link href="/api/transparency" className="home-inline-link">
              JSON snapshot
            </Link>
          </div>

          <div className="home-stat-grid">
            {statCards.map((card) => (
              <div className="home-stat-tile" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>

          <div className="home-strategy-grid">
            {strategyCards.map((card) => (
              <article className="home-strategy-tile" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="section home-map-stage" id="activity-map">
        <div className="home-section-header">
          <div>
            <div className="badge">Geo map</div>
            <h2>Postal-level activity, but dressed like it belongs on purpose.</h2>
          </div>
          <p className="kicker">
            Listeners can still read the real location picture: where the venues are, where the shows are, and which
            postal clusters are carrying current momentum.
          </p>
        </div>
        <ActivityMap points={activityPoints} scopes={activityScopes} />
      </section>

      <section className="section home-gallery-grid">
        <article className="home-gallery-panel">
          <div className="home-section-header">
            <div>
              <div className="badge">Streaming feed</div>
              <h2>Live and upcoming signals</h2>
            </div>
            <p className="kicker">Still the core feed, just no longer buried under a generic landing page.</p>
          </div>
          <div className="grid grid-2">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </article>

        <article className="home-gallery-panel">
          <div className="home-section-header">
            <div>
              <div className="badge">Network pages</div>
              <h2>Artists, promoters, venues, and listeners</h2>
            </div>
            <p className="kicker">The profile layer stays visible, but it now supports the cleaner front-page rhythm.</p>
          </div>
          <div className="grid grid-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
