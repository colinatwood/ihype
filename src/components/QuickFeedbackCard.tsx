'use client';

import { useState } from 'react';

const quickCardStyle: React.CSSProperties = {
  border: '1px solid var(--line)', borderRadius: 10, padding: '18px 20px',
  background: 'var(--bg-2, #100d09)', color: 'inherit',
};

export function QuickFeedbackCard() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<'bug' | 'suggestion' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/support/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), category, url: window.location.href }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not send feedback.');
        return;
      }
      setDone(true);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ ...quickCardStyle, textAlign: 'left', cursor: 'pointer', font: 'inherit' }} type="button">
        <div style={{ fontSize: 24, marginBottom: 8 }} aria-hidden="true">💬</div>
        <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 4 }}>Quick Feedback</div>
        <div style={{ fontSize: 12, color: 'var(--ink-a55)' }}>A bug or an idea — no reply needed</div>
      </button>
    );
  }

  return (
    <div style={quickCardStyle}>
      {done ? (
        <p style={{ fontSize: 13, color: '#22e5d4' }}>Thanks — sent.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['bug', 'suggestion', 'other'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{ flex: 1, padding: '5px 8px', borderRadius: 6, fontSize: 11, textTransform: 'capitalize', border: 'none', cursor: 'pointer', background: category === c ? '#ff5029' : 'var(--line)', color: category === c ? '#fff' : 'var(--ink)' }}
                type="button"
              >
                {c}
              </button>
            ))}
          </div>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            style={{ width: '100%', marginBottom: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--hair-100)', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }}
            value={message}
          />
          {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 8 }}>{error}</p>}
          <button
            disabled={submitting || !message.trim()}
            onClick={submit}
            style={{ width: '100%', padding: '8px', borderRadius: 8, border: 'none', background: '#ff5029', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            type="button"
          >
            {submitting ? 'Sending…' : 'Send'}
          </button>
        </>
      )}
    </div>
  );
}
