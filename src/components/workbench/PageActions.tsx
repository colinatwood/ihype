'use client';

import React, { useState } from 'react';
import { getProfilePathForType } from '@/lib/profile-paths';

type PageActionsProps = {
  /** ProfileType string: ARTIST | DJ | VENUE | LISTENER */
  type?: string | null;
  slug?: string | null;
  /** Title used for the native share sheet. */
  title?: string;
  /** Compact pill styling for the mobile surface (MobilePrimitives T tokens). */
  compact?: boolean;
  style?: React.CSSProperties;
};

/**
 * "View page" + "Share" buttons for the user's public profile page.
 * Renders nothing when the user has no profile yet (no slug).
 * Works on both workbench surfaces (desktop shell and mobile screens).
 */
export function PageActions({ type, slug, title, compact = false, style }: PageActionsProps) {
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  if (!slug || !type) return null;
  const path = getProfilePathForType(type, slug);

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: title ?? 'My iHYPE page', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt('Copy this link', url);
      }
      setStatus('done');
      window.setTimeout(() => setStatus('idle'), 1800);
    } catch {
      // Ignore canceled shares and clipboard failures; the buttons stay usable.
    }
  }

  const base: React.CSSProperties = compact
    ? {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 11px', borderRadius: 99,
        fontFamily: '"JetBrains Mono",monospace', fontSize: 10, fontWeight: 700,
        letterSpacing: '.08em', textTransform: 'uppercase',
        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
      }
    : {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 8,
        fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700,
        letterSpacing: '.06em', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
      };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...base,
          border: '1px solid rgba(255,80,41,.4)',
          background: 'rgba(255,80,41,.06)',
          color: '#ff5029',
        }}
      >
        View page ↗
      </a>
      <button
        type="button"
        onClick={handleShare}
        style={{
          ...base,
          border: '1px solid rgba(34,229,212,.3)',
          background: status === 'done' ? 'rgba(34,229,212,.15)' : 'rgba(34,229,212,.06)',
          color: '#22e5d4',
        }}
      >
        {status === 'done' ? 'Shared ✓' : 'Share'}
      </button>
    </div>
  );
}
