'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [dismissed, setDismissed] = useState(true); // default true to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent-dismissed');
    if (!stored) {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    localStorage.setItem('cookie-consent-dismissed', '1');
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--bg-3)',
        borderTop: '1px solid var(--line-2)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
        fontSize: 13
      }}
    >
      <span>We use essential cookies for authentication. No tracking or ad cookies.</span>
      <button className="button small" onClick={dismiss}>
        Dismiss
      </button>
    </div>
  );
}
