'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminInviteCodesGenerate() {
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function generate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not generate codes.');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        max={100}
        min={1}
        onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
        style={{ width: 56, padding: '6px 8px', fontSize: 13, borderRadius: 6, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)' }}
        type="number"
        value={count}
      />
      <button className="button" disabled={submitting} onClick={generate} style={{ fontSize: 13 }} type="button">
        {submitting ? 'Generating…' : 'Generate'}
      </button>
      {error && <span style={{ color: '#ff5029', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
