import type { DirectoryBrowserProfile } from '@/components/ProfileDirectoryBrowser';
import type { ReactNode } from 'react';
import {
  type DiscoverModuleId,
  type DiscoverRoleKey
} from '@/lib/discover-modules';

type DirectoryProfile = DirectoryBrowserProfile;

function getRoleKeyFromHref(currentHref: string): DiscoverRoleKey | null {
  if (currentHref.startsWith('/fans')) return 'fans';
  if (currentHref.startsWith('/artists')) return 'artists';
  if (currentHref.startsWith('/promoters')) return 'promoters';
  if (currentHref.startsWith('/venues')) return 'venues';
  return null;
}

export function ProfileDirectoryPage({
  currentHref,
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
  const roleKey = getRoleKeyFromHref(currentHref);

  return (
    <div className={roleKey ? `signed-landing-schema signed-landing-schema-${roleKey}` : undefined}>
      {moduleSubheader}

      <main className="container section signed-landing-main">
        {modulePanel}
      </main>
    </div>
  );
}
