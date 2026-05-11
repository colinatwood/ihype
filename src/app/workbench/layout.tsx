import type { ReactNode } from 'react';
import { SitePlayerDock } from '@/components/GlobalMediaPlayer';
import { HeaderLogo } from '@/components/HeaderLogo';
import { HeaderSearch } from '@/components/HeaderSearch';
import { HeaderStats } from '@/components/HeaderStats';

export default function WorkbenchLayout({ children }: { children: ReactNode }) {
  return (
    // wb-shell covers the entire viewport, sits above the root .site-nav
    <div className="wb-shell">
      <header className="wb-header" aria-label="Workbench header">
        <div className="wb-header-inner">
          <HeaderLogo />
          <HeaderStats />
          <HeaderSearch />
        </div>
      </header>
      {children}
      <SitePlayerDock />
    </div>
  );
}
