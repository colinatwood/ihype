'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const MIN_VISIBLE_MS = 900;
const FADE_MS = 300;

/**
 * Launch splash for the installed PWA only — regular browser tabs never see
 * this. An installed app has no browser chrome, so without this it flashes
 * straight to a blank page while fonts/JS settle after the OS's own
 * (icon-based) launch screen disappears.
 */
export function AppSplash() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
    if (!isStandalone) return;

    setVisible(true);
    const fadeTimer = setTimeout(() => setFading(true), MIN_VISIBLE_MS);
    const removeTimer = setTimeout(() => setVisible(false), MIN_VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden="true" className={`app-splash${fading ? ' app-splash-fade' : ''}`}>
      <Image alt="" height={144} priority src="/brand/logo-sticker-2026.png" width={144} />
    </div>
  );
}
