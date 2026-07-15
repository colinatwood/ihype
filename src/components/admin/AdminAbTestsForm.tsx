'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminAbTestsForm() {
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    if (!key.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim(), description: description.trim() || undefined, enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not save test.');
        return;
      }
      setKey('');
      setDescription('');
      setEnabled(false);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
      <input
        onChange={(e) => setKey(e.target.value)}
        placeholder="key (e.g. new-onboarding)"
        style={{ padding: '6px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)' }}
        value={key}
      />
      <input
        onChange={(e) => setDescription(e.target.value)}
        placeholder="description (optional)"
        style={{ padding: '6px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)', flex: 1, minWidth: 180 }}
        value={description}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <input checked={enabled} onChange={(e) => setEnabled(e.target.checked)} type="checkbox" />
        enabled
      </label>
      <button className="button" disabled={submitting || !key.trim()} onClick={submit} style={{ fontSize: 13 }} type="button">
        {submitting ? 'Saving…' : 'Create / update'}
      </button>
      {error && <span style={{ color: '#ff5029', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
