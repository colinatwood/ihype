'use client';

import { useState } from 'react';

export function PayoutActions({ title, showId, grossCents }: { title: string; showId: string; grossCents: number }) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${title} · Payout receipt`, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert('Receipt link copied to clipboard.');
    }
  }

  async function submitDispute() {
    if (!reason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/payouts/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, reason: reason.trim(), expectedAmountCents: grossCents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not submit dispute.');
        return;
      }
      setDone('Dispute filed — support will follow up by email.');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  function closeDispute() {
    setDisputeOpen(false);
    setReason('');
    setError(null);
    setDone(null);
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => window.print()}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid var(--line, var(--hair-100))', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', background: 'transparent', color: 'var(--ink)', padding: '9px 18px' }}
          type="button"
        >
          Download PDF
        </button>
        <button
          onClick={share}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', background: '#ff5029', color: '#fff', padding: '9px 18px', boxShadow: '0 4px 20px rgba(255,80,41,.3)' }}
          type="button"
        >
          Share receipt
        </button>
        <button
          onClick={() => setDisputeOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid var(--line, var(--hair-100))', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', background: 'transparent', color: 'var(--ink-a60, #9e9080)', padding: '9px 18px' }}
          type="button"
        >
          Dispute
        </button>
      </div>

      {disputeOpen && (
        <div
          aria-modal="true"
          className="ihype-sheet-overlay"
          onClick={(e) => e.target === e.currentTarget && closeDispute()}
          role="dialog"
        >
          <div className="ihype-sheet-panel">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Dispute this payout</h3>
            {done ? (
              <>
                <p style={{ fontSize: 13, color: '#22e5d4', marginBottom: 16 }}>{done}</p>
                <button className="btn btn-primary" onClick={closeDispute} style={{ width: '100%' }} type="button">Close</button>
              </>
            ) : (
              <>
                <label htmlFor="payout-dispute-reason" style={{ display: 'block', fontSize: 12, color: 'var(--ink-a50)', marginBottom: 6 }}>
                  What looks wrong with this payout?
                </label>
                <textarea
                  id="payout-dispute-reason"
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. the sold-ticket count doesn't match what I see in my dashboard"
                  rows={4}
                  style={{ width: '100%', marginBottom: 16, padding: '10px 14px', border: '1px solid var(--hair-100)', borderRadius: 8, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', resize: 'vertical' }}
                  value={reason}
                />
                {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" onClick={closeDispute} style={{ flex: 1 }} type="button">Cancel</button>
                  <button className="btn btn-primary" disabled={submitting || !reason.trim()} onClick={submitDispute} style={{ flex: 1 }} type="button">
                    {submitting ? 'Submitting…' : 'Submit dispute'}
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
