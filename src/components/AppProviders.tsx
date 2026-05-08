'use client';

import { type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { RouteAccessibilityAnnouncer } from '@/components/AccessibilityControls';
import { AdminPerspectiveProvider } from '@/components/AdminPerspective';
import { MediaPlayerProvider } from '@/components/GlobalMediaPlayer';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminPerspectiveProvider>
        <MediaPlayerProvider>
          <RouteAccessibilityAnnouncer />
          {children}
        </MediaPlayerProvider>
      </AdminPerspectiveProvider>
    </SessionProvider>
  );
}
