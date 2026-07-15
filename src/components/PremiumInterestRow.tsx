'use client';

import { useState } from 'react';

export function PremiumInterestRow({ email }: { email: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function notifyMe() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/premium/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not save your interest.');
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
    <div className="settings-section">
      <div className="settings-section-title">Premium</div>
      <div className="settings-group">
        <div className="settings-row">
          <div>
            <div className="settings-row-label">iHYPE Premium</div>
            <div className="settings-row-detail">
              {error ?? (done ? "You're on the list — we'll email you when it's ready." : 'Not available yet — get notified when it launches')}
            </div>
          </div>
          {!done && (
            <button className="settings-btn settings-btn-ghost" disabled={submitting} onClick={notifyMe} type="button">
              {submitting ? 'Saving…' : 'Notify me'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
