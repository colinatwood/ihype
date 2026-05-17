'use client';

import { useState } from 'react';

export function MerchPreorderForm({ profileId }: { profileId: string }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/profile/merch-preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, item: fd.get('item'), email: fd.get('email'), note: fd.get('note') })
      });
      const d = await res.json();
      if (res.ok) { setStatus('done'); setMsg(d.message ?? 'Pre-order submitted!'); }
      else { setStatus('error'); setMsg(d.error ?? 'Submission failed.'); }
    } catch {
      setStatus('error');
      setMsg('Network error. Please try again.');
    }
  }

  if (status === 'done') return <div className="callout success">{msg}</div>;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label className="label" htmlFor="merch-item">Merch item</label>
        <input className="input" id="merch-item" name="item" required placeholder="e.g. Hoodie (L), Vinyl LP" />
      </div>
      <div>
        <label className="label" htmlFor="merch-email">Your email</label>
        <input className="input" id="merch-email" name="email" required type="email" />
      </div>
      <div>
        <label className="label" htmlFor="merch-note">Note (optional)</label>
        <input className="input" id="merch-note" name="note" placeholder="Size, colour, etc." />
      </div>
      {status === 'error' && <div className="callout error">{msg}</div>}
      <button className="button" disabled={status === 'submitting'} type="submit">
        {status === 'submitting' ? 'Submitting…' : 'Pre-order'}
      </button>
    </form>
  );
}
