'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Capture whether a SW already controls this page *before* registering.
    // If null, this is first install — no reload needed. If set, a controller
    // change means a new deployment just took over and we should reload.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((err) => {
      console.error('SW registration failed:', err);
    });
  }, []);

  return null;
}
