import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { AdminPerspectiveBar } from '@/components/AdminPerspective';
import { HeaderMediaPlayer } from '@/components/GlobalMediaPlayer';
import { AppProviders } from '@/components/AppProviders';
import { HeaderAuthLinks } from '@/components/HeaderAuthLinks';

export const metadata = {
  title: 'iHYPE.org',
  description: 'Streaming-first music discovery for artists, promoters, venues, and fans.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <div aria-hidden="true" className="site-background">
            <span className="site-background-orb site-background-orb-a" />
            <span className="site-background-orb site-background-orb-b" />
            <span className="site-background-grid" />
          </div>
          <div className="site-shell">
            <AdminPerspectiveBar />
            <header className="nav">
              <div className="container nav-inner">
                <Link href="/" className="nav-logo nav-logo-left" aria-label="Go to iHYPE home">
                  <span className="nav-logo-mark">
                    <span className="nav-logo-word">iHYPE</span>
                    <span className="nav-logo-dot">.org</span>
                  </span>
                </Link>
                <div className="nav-player-slot nav-player-slot-centered">
                  <HeaderMediaPlayer />
                </div>
                <HeaderAuthLinks />
              </div>
            </header>
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
