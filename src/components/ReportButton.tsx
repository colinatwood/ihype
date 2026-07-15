'use client';

import { useState } from 'react';

const REASONS = ['Spam', 'Harassment or hate', 'Impersonation', 'Copyright / stolen content', 'Something else'];

export function ReportButton({
  targetType,
  targetId,
  className,
}: {
  targetType: 'profile' | 'show' | 'media' | 'ticket';
  targetId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function close() {
    setOpen(false);
    setReason('');
    setDetails('');
    setError(null);
    setDone(false);
  }

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/content-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, details: details.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not submit report.');
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
        Report
      </button>

      {open && (
        <div
          aria-modal="true"
          className="ihype-sheet-overlay"
          onClick={(e) => e.target === e.currentTarget && close()}
          role="dialog"
        >
          <div className="ihype-sheet-panel">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Report this {targetType}</h3>
            {done ? (
              <>
                <p style={{ fontSize: 13, color: '#22e5d4', marginBottom: 16 }}>Thanks — our team will review this.</p>
                <button className="btn btn-primary" onClick={close} style={{ width: '100%' }} type="button">Close</button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {REASONS.map((r) => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-a70)' }}>
                      <input checked={reason === r} name="report-reason" onChange={() => setReason(r)} type="radio" value={r} />
                      {r}
                    </label>
                  ))}
                </div>
                <textarea
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Any extra detail (optional)"
                  rows={3}
                  style={{ width: '100%', marginBottom: 16, padding: '10px 14px', border: '1px solid var(--hair-100)', borderRadius: 8, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', resize: 'vertical' }}
                  value={details}
                />
                {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" onClick={close} style={{ flex: 1 }} type="button">Cancel</button>
                  <button className="btn btn-primary" disabled={submitting || !reason} onClick={submit} style={{ flex: 1 }} type="button">
                    {submitting ? 'Submitting…' : 'Submit report'}
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
