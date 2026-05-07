import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { HeaderMediaPlayer } from '@/components/GlobalMediaPlayer';
import { AppProviders } from '@/components/AppProviders';
import { HeaderAuthLinks } from '@/components/HeaderAuthLinks';
import { HeaderLogo } from '@/components/HeaderLogo';

export const metadata: Metadata = {
  title: {
    default: 'iHYPE.org',
    template: '%s · iHYPE'
  },
  description: 'Streaming-first music discovery for artists, promoters, venues, and fans.',
  openGraph: {
    siteName: 'iHYPE',
    type: 'website',
    title: 'iHYPE.org',
    description: 'Streaming-first music discovery for artists, promoters, venues, and fans.',
  },
  twitter: {
    card: 'summary',
    title: 'iHYPE.org',
    description: 'Streaming-first music discovery for artists, promoters, venues, and fans.',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ihype.org'
  )
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
            <header className="nav">
              <div className="container nav-inner">
                <HeaderLogo />
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
