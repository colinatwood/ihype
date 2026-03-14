'use client';

import { type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AdminPerspectiveProvider } from '@/components/AdminPerspective';
import { MediaPlayerProvider } from '@/components/GlobalMediaPlayer';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminPerspectiveProvider>
        <MediaPlayerProvider>{children}</MediaPlayerProvider>
      </AdminPerspectiveProvider>
    </SessionProvider>
  );
}
