'use client';

import { useEffect, useState } from 'react';

export function HypeStreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/hype-streak')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setStreak(d.streak ?? 0))
      .catch(() => setStreak(0));
  }, []);

  if (!streak) return null;

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#ff5029', background: 'rgba(255,80,41,.12)', borderRadius: 999, padding: '2px 8px',
      }}
    >
      🔥 {streak}
    </span>
  );
}
