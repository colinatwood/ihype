import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { auth, signOut } from '@/lib/auth';
import { MediaPlayerProvider } from '@/components/GlobalMediaPlayer';

export const metadata = {
  title: 'ihype.org',
  description: 'Streaming-first music discovery for artists, promoters, venues, and listeners.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <MediaPlayerProvider>
          <header className="nav">
            <div className="container nav-inner">
              <Link href="/" className="brand">
                ihype<span>.org</span>
              </Link>
              <nav className="nav-links nav-links-primary">
                <Link href="/artists">Artists</Link>
                <Link href="/promoters">Promoters</Link>
                <Link href="/venues">Venues</Link>
              </nav>
              <div className="nav-links nav-links-auth">
                {session?.user ? (
                  <>
                    <Link href="/dashboard">Dashboard</Link>
                    <span className="nav-divider">|</span>
                    <form
                      action={async () => {
                        'use server';
                        await signOut({ redirectTo: '/' });
                      }}
                    >
                      <button className="nav-text-button" type="submit">
                        Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login">Sign In</Link>
                    <span className="nav-divider">|</span>
                    <Link href="/register">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </header>
          {children}
          <footer className="footer container">
            ihype.org production starter. Streaming-first music discovery, because the internet apparently needed more
            late-night dashboards. <Link href="/launch-readiness">Launch readiness</Link>{' '}
            <Link href="/integrity">Integrity</Link>
          </footer>
        </MediaPlayerProvider>
      </body>
    </html>
  );
}
