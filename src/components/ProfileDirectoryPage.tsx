import type { DirectoryBrowserProfile } from '@/components/ProfileDirectoryBrowser';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  getDiscoverModulesForRole,
  getTopMarketLabels,
  type DiscoverModuleId,
  type DiscoverRoleKey
} from '@/lib/discover-modules';
import { signedRoleLandingCopy } from '@/lib/role-landing-content';

type DirectoryProfile = DirectoryBrowserProfile;

function getRoleKeyFromHref(currentHref: string): DiscoverRoleKey | null {
  if (currentHref.startsWith('/fans')) return 'fans';
  if (currentHref.startsWith('/artists')) return 'artists';
  if (currentHref.startsWith('/promoters')) return 'promoters';
  if (currentHref.startsWith('/venues')) return 'venues';
  return null;
}

export function ProfileDirectoryPage({
  badge,
  title,
  description,
  profiles,
  currentHref,
  activeModule,
  modulePanel,
  moduleSubheader
}: {
  badge: string;
  title: string;
  description: string;
  profiles: DirectoryProfile[];
  currentHref: string;
  activeModule: DiscoverModuleId;
  modulePanel?: ReactNode;
  moduleSubheader?: ReactNode;
}) {
  const topMarkets = getTopMarketLabels(profiles);
  const roleKey = getRoleKeyFromHref(currentHref);
  const roleCopy = roleKey ? signedRoleLandingCopy[roleKey] : null;
  const moduleOptions = roleKey ? getDiscoverModulesForRole(roleKey) : [];
  const activeModuleLabel = moduleOptions.find((module) => module.id === activeModule)?.label ?? 'Module';

  return (
    <div className={roleKey ? `signed-landing-schema signed-landing-schema-${roleKey}` : undefined}>
      {moduleSubheader}

      <main className="container section signed-landing-main">
        {roleKey && roleCopy ? (
          <section className="signed-landing-hero" aria-label={`${roleCopy.eyebrow} overview`}>
            <div className="signed-landing-copy">
              <div className="signed-landing-eyebrow">
                <span className="signed-landing-dot" aria-hidden="true" />
                {roleCopy.eyebrow}
              </div>
              <h1>
                {roleCopy.heading} <em>{roleCopy.emphasis}</em>
              </h1>
              <p>{description}</p>
              <div className="signed-landing-module-strip" aria-label="Role modules">
                {moduleOptions.map((module) => (
                  <Link
                    className={module.id === activeModule ? 'signed-landing-module active' : 'signed-landing-module'}
                    href={`${currentHref}?module=${module.id}`}
                    key={module.id}
                  >
                    {module.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="signed-role-signal-grid" aria-label={`${roleCopy.eyebrow} signals`}>
              <article className="signed-role-signal-card">
                <span>{roleCopy.signalLabel}</span>
                <strong>{activeModuleLabel}</strong>
                <small>Selected module</small>
              </article>
              <article className="signed-role-signal-card">
                <span>Profiles</span>
                <strong>{profiles.length}</strong>
                <small>{title}</small>
              </article>
              <article className="signed-role-signal-card">
                <span>Top market</span>
                <strong>{topMarkets[0] ?? 'Building'}</strong>
                <small>Live scene signal</small>
              </article>
            </div>
          </section>
        ) : null}

        {modulePanel}
      </main>
    </div>
  );
}
