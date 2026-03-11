'use client';

import { useState } from 'react';

type HypeButtonProps = {
  targetType: 'show' | 'profile';
  targetId: string;
  initialCount: number;
  entityLabel?: string;
};

export function HypeButton({ targetType, targetId, initialCount, entityLabel }: HypeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const noun = entityLabel ?? (targetType === 'show' ? 'show' : 'profile');

  async function handleHype() {
    setPending(true);
    setMessage(null);

    const response = await fetch('/api/hype', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId })
    });

    const data = await response.json();
    if (response.ok) {
      setCount(data.hypeCount);
      setMessage(data.created ? `Hyped this ${noun}` : `You already hyped this ${noun}`);
    } else {
      setMessage(data.error ?? `Could not hype this ${noun}`);
    }

    setPending(false);
  }

  return (
    <div className="cta-row">
      <button className="button" onClick={handleHype} disabled={pending}>
        {pending ? 'Hype...' : `Hype ${count}`}
      </button>
      {message ? <span className="meta">{message}</span> : null}
    </div>
  );
}
