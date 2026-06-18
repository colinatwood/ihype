'use client';
import { useState } from 'react';

export function NewsletterSignup({ profileId }: { profileId: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profileId }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(95,211,138,.08)', border: '1px solid rgba(95,211,138,.2)', marginTop: 16 }}>
        <div style={{ fontWeight: 700, color: '#5fd38a', marginBottom: 4 }}>You&apos;re subscribed!</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.65 }}>We&apos;ll let you know when there&apos;s something new.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16, padding: '16px 20px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.95rem' }}>Stay in the loop</div>
      <div style={{ fontSize: '0.82rem', opacity: 0.55, marginBottom: 12 }}>Get updates, new releases, and show announcements.</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{ flex: 1, padding: '8px 12px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: 'inherit', fontSize: '0.88rem', outline: 'none' }}
        />
        <button type="submit" disabled={state === 'loading'} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--profile-design-accent, #ff5029)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: state === 'loading' ? 0.6 : 1 }}>
          {state === 'loading' ? '…' : 'Subscribe'}
        </button>
      </div>
      {state === 'error' && <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#ff5029' }}>Something went wrong — please try again.</div>}
    </form>
  );
}
