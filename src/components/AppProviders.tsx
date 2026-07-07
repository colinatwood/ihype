'use client';

import { type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AccessibilityProvider, RouteAccessibilityAnnouncer } from '@/components/AccessibilityControls';
import { MediaPlayerProvider } from '@/components/GlobalMediaPlayer';
import { NativePushRegistration } from '@/components/NativePushRegistration';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AccessibilityProvider>
        <MediaPlayerProvider>
          <RouteAccessibilityAnnouncer />
          <NativePushRegistration />
          {children}
        </MediaPlayerProvider>
      </AccessibilityProvider>
    </SessionProvider>
  );
}
