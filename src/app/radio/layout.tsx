import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'iHYPE Radio',
  description: 'Listen to live and on-demand audio-only radio shows from independent DJs and artists on iHYPE.',
  openGraph: {
    title: 'iHYPE Radio',
    description: 'Live and on-demand audio-only radio shows from independent DJs and artists.',
    siteName: 'iHYPE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'iHYPE Radio',
    description: 'Live and on-demand audio-only radio shows from independent DJs and artists.',
  },
};

export default function RadioLayout({ children }: { children: ReactNode }) {
  return children;
}
