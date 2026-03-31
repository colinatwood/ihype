import { ProfileDirectoryBrowser, type DirectoryBrowserProfile } from '@/components/ProfileDirectoryBrowser';
import type { ReactNode } from 'react';
import { getTopMarketLabels } from '@/lib/discover-modules';

type DirectoryProfile = DirectoryBrowserProfile;

export function ProfileDirectoryPage({
  badge,
  title,
  description,
  profiles,
  currentHref,
  modulePanel,
  moduleSubheader
}: {
  badge: string;
  title: string;
  description: string;
  profiles: DirectoryProfile[];
  currentHref: string;
  modulePanel?: ReactNode;
  moduleSubheader?: ReactNode;
}) {
  const topMarkets = getTopMarketLabels(profiles);

  return (
    <>
      {moduleSubheader}

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

        {modulePanel}

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
    </>
  );
}
