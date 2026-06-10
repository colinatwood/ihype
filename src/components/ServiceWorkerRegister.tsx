'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // Explicitly trigger an update check on every page load.
        // Covers PWAs restored from background where no navigation event fires.
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  }, []);

  return null;
}
