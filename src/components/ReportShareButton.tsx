'use client';

import { useState } from 'react';

interface ReportShareButtonProps {
  archetype: string;
  topCity: string;
  artistCount: number;
}

export default function ReportShareButton({ archetype, topCity, artistCount }: ReportShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `My music taste: ${archetype} | Top scene: ${topCity} | ${artistCount} artists hyped | #iHYPE ihype.org`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(255,80,41,0.3)' : 'rgba(255,80,41,0.15)',
        border: '1px solid rgba(255,80,41,0.5)',
        color: copied ? '#ff5029' : '#ccc',
        borderRadius: 8,
        padding: '0.6rem 1.4rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        letterSpacing: '0.03em',
      }}
    >
      {copied ? 'Copied!' : 'Copy share text'}
    </button>
  );
}
