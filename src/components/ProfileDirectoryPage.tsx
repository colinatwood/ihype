import { ProfileDirectoryBrowser, type DirectoryBrowserProfile } from '@/components/ProfileDirectoryBrowser';

type DirectoryProfile = DirectoryBrowserProfile;

function getTopMarkets(profiles: DirectoryProfile[]) {
  const counts = new Map<string, number>();

  for (const profile of profiles) {
    const label = [profile.city, profile.stateRegion ?? profile.country].filter(Boolean).join(', ');
    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label, count]) => `${label} (${count})`);
}

export function ProfileDirectoryPage({
  badge,
  title,
  description,
  profiles,
  currentHref,
  moduleLabel,
  modules
}: {
  badge: string;
  title: string;
  description: string;
  profiles: DirectoryProfile[];
  currentHref: string;
  moduleLabel?: string;
  modules?: string[];
}) {
  const topMarkets = getTopMarkets(profiles);

  return (
    <main className="container section">
      <section className="directory-hero panel">
        <div className="directory-hero-copy">
          <div className="badge">{badge}</div>
          <h1 className="directory-title">{title}</h1>
          <p className="subtitle">{description}</p>
        </div>

        <div className="directory-hero-stats">
          <div className="directory-stat">
            <span>Profiles</span>
            <strong>{profiles.length}</strong>
          </div>
          <div className="directory-stat">
            <span>Focus</span>
            <strong>Find + hype</strong>
          </div>
          <div className="directory-stat">
            <span>Top markets</span>
            <strong>{topMarkets[0] ?? 'Building'}</strong>
          </div>
        </div>
      </section>

      {modules?.length ? (
        <section className="section directory-module-shell" aria-label={moduleLabel ?? 'Associated modules'}>
          <div className="directory-module-header">
            <div className="badge">{moduleLabel ?? 'Associated modules'}</div>
            <h2 className="directory-module-title">Tools connected to this lane</h2>
          </div>
          <div className="directory-module-grid">
            {modules.map((module) => (
              <span className="directory-module-pill" key={module}>
                {module}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {topMarkets.length ? (
        <section className="section directory-market-strip" aria-label="Top markets">
          {topMarkets.map((market) => (
            <span className="directory-market-pill" key={market}>
              {market}
            </span>
          ))}
        </section>
      ) : null}

      <section className="section">
        <ProfileDirectoryBrowser currentHref={currentHref} profiles={profiles} />
      </section>
    </main>
  );
}
