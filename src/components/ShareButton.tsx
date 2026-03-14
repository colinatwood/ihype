'use client';

import { useState } from 'react';

type ShareButtonProps = {
  path: string;
  title: string;
  className?: string;
  label?: string;
};

export function ShareButton({ path, title, className, label = 'Share' }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt('Copy this link', url);
      }

      setStatus('done');
      window.setTimeout(() => setStatus('idle'), 1800);
    } catch {
      // Ignore canceled shares and clipboard failures; the button stays usable.
    }
  }

  return (
    <button className={className ?? 'button small secondary'} onClick={handleShare} type="button">
      {status === 'done' ? 'Shared' : label}
    </button>
  );
}
