'use client';

import { type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { MediaPlayerProvider } from '@/components/GlobalMediaPlayer';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MediaPlayerProvider>{children}</MediaPlayerProvider>
    </SessionProvider>
  );
}
