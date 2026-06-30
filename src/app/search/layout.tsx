import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search artists, DJs, venues, songs, and shows on iHYPE.',
  openGraph: {
    title: 'Search · iHYPE',
    description: 'Search artists, DJs, venues, songs, and shows on iHYPE.',
    siteName: 'iHYPE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Search · iHYPE',
    description: 'Search artists, DJs, venues, songs, and shows on iHYPE.',
  },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
