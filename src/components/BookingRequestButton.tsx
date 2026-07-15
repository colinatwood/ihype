'use client';

import { useState } from 'react';

export function BookingRequestButton({ profileId, className }: { profileId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function close() {
    setOpen(false);
    setMessage('');
    setError(null);
    setDone(false);
  }

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toProfileId: profileId, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not send request.');
        return;
      }
      setDone(true);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className={className ?? 'button small secondary'} onClick={() => setOpen(true)} type="button">
        Request to book
      </button>

      {open && (
        <div
          aria-modal="true"
          className="ihype-sheet-overlay"
          onClick={(e) => e.target === e.currentTarget && close()}
          role="dialog"
        >
          <div className="ihype-sheet-panel">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Send a booking request</h3>
            {done ? (
              <>
                <p style={{ fontSize: 13, color: '#22e5d4', marginBottom: 16 }}>Sent — they&apos;ll see it in their Pages inbox.</p>
                <button className="btn btn-primary" onClick={close} style={{ width: '100%' }} type="button">Close</button>
              </>
            ) : (
              <>
                <label htmlFor="booking-request-message" style={{ display: 'block', fontSize: 12, color: 'var(--ink-a50)', marginBottom: 6 }}>
                  Your message
                </label>
                <textarea
                  id="booking-request-message"
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell them about the date, venue, or event you have in mind"
                  rows={4}
                  style={{ width: '100%', marginBottom: 16, padding: '10px 14px', border: '1px solid var(--hair-100)', borderRadius: 8, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', resize: 'vertical' }}
                  value={message}
                />
                {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" onClick={close} style={{ flex: 1 }} type="button">Cancel</button>
                  <button className="btn btn-primary" disabled={submitting || !message.trim()} onClick={submit} style={{ flex: 1 }} type="button">
                    {submitting ? 'Sending…' : 'Send request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
