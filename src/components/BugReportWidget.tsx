'use client';

import { useEffect, useState } from 'react';

export const OPEN_BUG_REPORT_EVENT = 'ihype:open-bug-report';

export function BugReportWidget() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_BUG_REPORT_EVENT, handler);
    return () => window.removeEventListener(OPEN_BUG_REPORT_EVENT, handler);
  }, []);

  function close() {
    setOpen(false);
    setDescription('');
    setError(null);
    setDone(false);
  }

  async function submit() {
    if (!description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          url: window.location.href,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }),
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
      <button
        aria-label="Report a bug"
        className="bug-report-btn"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 20,
          zIndex: 40,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid var(--line, var(--hair-100))',
          background: 'var(--bg2, #100d09)',
          color: 'var(--ink-a60, #9e9080)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,.25)',
        }}
        type="button"
      >
        <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <path d="M12 8v4M12 16h.01" />
          <path d="M8.5 3.5 12 7l3.5-3.5M4 14a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z" />
        </svg>
      </button>

      {open && (
        <div
          aria-modal="true"
          className="ihype-sheet-overlay"
          onClick={(e) => e.target === e.currentTarget && close()}
          role="dialog"
        >
          <div className="ihype-sheet-panel">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Report a bug</h3>
            {done ? (
              <>
                <p style={{ fontSize: 13, color: '#22e5d4', marginBottom: 16 }}>Thanks — we&apos;ve got it.</p>
                <button className="btn btn-primary" onClick={close} style={{ width: '100%' }} type="button">Close</button>
              </>
            ) : (
              <>
                <label htmlFor="bug-report-description" style={{ display: 'block', fontSize: 12, color: 'var(--ink-a50)', marginBottom: 6 }}>
                  What went wrong?
                </label>
                <textarea
                  id="bug-report-description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened and what you expected instead"
                  rows={4}
                  style={{ width: '100%', marginBottom: 16, padding: '10px 14px', border: '1px solid var(--hair-100)', borderRadius: 8, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', resize: 'vertical' }}
                  value={description}
                />
                {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" onClick={close} style={{ flex: 1 }} type="button">Cancel</button>
                  <button className="btn btn-primary" disabled={submitting || !description.trim()} onClick={submit} style={{ flex: 1 }} type="button">
                    {submitting ? 'Sending…' : 'Send'}
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
