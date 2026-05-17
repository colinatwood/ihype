'use client';

import { useState } from 'react';

export function ShowRemindButton({
  showId,
  initialSet,
  canRemind
}: {
  showId: string;
  initialSet: boolean;
  canRemind: boolean;
}) {
  const [reminded, setReminded] = useState(initialSet);
  const [loading, setLoading] = useState(false);

  if (!canRemind) return null;

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shows/${showId}/remind`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { reminded?: boolean };
        setReminded(Boolean(data.reminded));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`button small ${reminded ? '' : 'secondary'}`}
      onClick={toggle}
      disabled={loading}
    >
      {reminded ? 'Reminder set ✓' : 'Remind me'}
    </button>
  );
}
