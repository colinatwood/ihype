import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { HeaderMediaPlayer } from '@/components/GlobalMediaPlayer';
import { AppProviders } from '@/components/AppProviders';
import { HeaderAuthLinks } from '@/components/HeaderAuthLinks';
import { SiteSubnav } from '@/components/SiteSubnav';

export const metadata = {
  title: 'iHYPE.org',
  description: 'Streaming-first music discovery for artists, promoters, venues, and listeners.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <header className="nav">
            <div className="container nav-inner">
              <Link href="/" className="nav-logo nav-logo-left" aria-label="iHYPE.org home">
                <span className="nav-logo-word">iHYPE</span>
                <span className="nav-logo-dot">.org</span>
              </Link>
              <div className="nav-player-slot nav-player-slot-centered">
                <HeaderMediaPlayer />
              </div>
              <HeaderAuthLinks />
            </div>
          </header>
          <SiteSubnav />
          {children}
          <footer className="footer container">
            <span>iHYPE.org connects artists, promoters, venues, and listeners through live signals, transparent hype, and direct discovery.</span>{' '}
            <Link href="/launch-readiness">Launch readiness</Link>{' '}
            <Link href="/integrity">Integrity</Link>{' '}
            <Link href="/shows">Shows</Link>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
