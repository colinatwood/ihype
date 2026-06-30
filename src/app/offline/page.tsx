'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const MESSAGES: Record<string, { headline: string; body: string; code: string }> = {
  offline: {
    headline: 'No connection',
    body: "You're offline right now. Your tickets and crate are still saved locally — reconnect to sync with the live feed.",
    code: 'ERR · OFFLINE',
  },
  '503': {
    headline: 'Back in a moment',
    body: 'iHYPE is temporarily unavailable. We\'re on it — check back in a few minutes.',
    code: 'HTTP 503 · SERVICE UNAVAILABLE',
  },
  '500': {
    headline: 'Something went wrong',
    body: 'An unexpected error occurred. We\'ve been notified and are looking into it.',
    code: 'HTTP 500 · INTERNAL SERVER ERROR',
  },
};

const RETRY_INTERVALS_MS = [8000, 15000, 30000];

export default function OfflinePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? 'offline';
  const msg = MESSAGES[code] ?? MESSAGES['offline'];
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [barWidth, setBarWidth] = useState(0);
  const [barDurationMs, setBarDurationMs] = useState(RETRY_INTERVALS_MS[0]);
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doRetry = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRetryMessage('Checking…');
    setRetrying(true);
    setTimeout(() => {
      fetch('/api/health', { method: 'HEAD', cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error('not ok');
          window.location.href = '/';
        })
        .catch(() => {
          setRetrying(false);
          const delay = RETRY_INTERVALS_MS[Math.min(retryCountRef.current, RETRY_INTERVALS_MS.length - 1)];
          retryCountRef.current += 1;
          startRetryBar(delay);
        });
    }, 600);
  };

  const startRetryBar = (ms: number) => {
    setBarWidth(0);
    setBarDurationMs(ms);
    requestAnimationFrame(() => setBarWidth(100));
    setRetryMessage(`Auto-retry in ${Math.round(ms / 1000)}s`);
    timerRef.current = setTimeout(doRetry, ms);
  };

  useEffect(() => {
    const handleOnline = () => {
      setRetryMessage('Connection restored — retrying…');
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    };
    window.addEventListener('online', handleOnline);
    startRetryBar(RETRY_INTERVALS_MS[0]);
    return () => {
      window.removeEventListener('online', handleOnline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualRetry = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    doRetry();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg, #0a0805)',
      color: 'var(--ink, #f0ebe5)',
      fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      padding: 24,
      position: 'relative',
    }}>
      <div style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{
          fontFamily: "var(--font-display, 'Syne', sans-serif)",
          fontWeight: 800,
          fontSize: '2.4rem',
          letterSpacing: '-0.04em',
          color: 'var(--accent, #ff5029)',
        }}>
          iH·YPE
        </div>

        <div style={{ fontSize: '3rem', margin: '22px 0 14px' }}>📡</div>

        <h1 style={{
          fontFamily: "var(--font-display, 'Syne', sans-serif)",
          fontWeight: 800,
          fontSize: '1.6rem',
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
        }}>
          {msg.headline}
        </h1>

        <p style={{
          fontSize: '0.96rem',
          lineHeight: 1.6,
          color: 'var(--ink-2, #9e9080)',
          margin: '0 0 16px',
        }}>
          {msg.body}
        </p>

        <div style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-3, #5a5048)',
          marginBottom: 28,
        }}>
          {msg.code}
        </div>

        <button
          onClick={handleManualRetry}
          disabled={retrying}
          style={{
            background: 'var(--accent, #ff5029)',
            color: '#fff',
            border: 'none',
            borderRadius: 9999,
            padding: '13px 28px',
            fontFamily: "var(--font-display, 'Syne', sans-serif)",
            fontWeight: 800,
            fontSize: '0.96rem',
            cursor: retrying ? 'default' : 'pointer',
            width: '100%',
            opacity: retrying ? 0.7 : 1,
            transition: 'opacity 150ms',
          }}
        >
          {retrying ? 'Connecting…' : 'Try again'}
        </button>

        <div style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: '0.7rem',
          color: 'var(--ink-3, #5a5048)',
          marginTop: 16,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          minHeight: 16,
        }}>
          {retryMessage}
        </div>

        <div style={{
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: '0.65rem',
          color: 'var(--ink-3, #5a5048)',
          marginTop: 8,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          Your data is safe on this device.
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${barWidth}%`,
          background: 'var(--accent, #ff5029)',
          transition: barWidth === 0 ? 'none' : `width ${barDurationMs / 1000}s linear`,
        }} />
      </div>
    </div>
  );
}
