'use client';

import { useState } from 'react';
import Link from 'next/link';

type Kind = 'deletion' | 'detach' | 'hype-wipe';

const OPTIONS: { kind: Kind; title: string; desc: string; danger?: boolean }[] = [
  { kind: 'deletion', title: 'Request data deletion', desc: 'Permanently erase your account and all data', danger: true },
  { kind: 'detach', title: 'Detach identity early', desc: 'Delete email verification link now instead of after 30 days' },
  { kind: 'hype-wipe', title: 'Wipe hype history', desc: 'Clear your past hype votes without deleting your account' },
];

const DONE_LABEL: Record<Kind, string> = {
  deletion: 'Account deletion requested — we’ll email you to confirm within 24h.',
  detach: 'Identity detachment requested — our team will confirm shortly.',
  'hype-wipe': 'Hype history wipe requested — our team will confirm shortly.',
};

export function SupportPrivacyPanel({ onReportProblem }: { onReportProblem: () => void }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Kind | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  function close() {
    setOpen(false);
    setDone(null);
    setError(null);
  }

  async function submitKind(kind: Kind) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/privacy/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Request failed');
        return;
      }
      setDone(kind);
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/privacy/export');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ihype-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed — try again or contact support.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="quick-card" onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}>
        <div className="quick-icon" aria-hidden="true">🔒</div>
        <div className="quick-title">Privacy</div>
        <div className="quick-desc">Report a problem, data deletion, identity detachment</div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && close()}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
        >
          <div style={{ width: '100%', maxWidth: 460, background: 'var(--bg-2, #100d09)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 26, maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>Privacy &amp; your data</h2>
              <button onClick={close} aria-label="Close" style={{ background: 'none', border: 'none', color: 'rgba(240,235,229,.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(240,235,229,.55)', marginBottom: 20 }}>
              You control your data. iHYPE never sells PII — locked in our charter.
            </p>

            {done ? (
              <div style={{ fontSize: 13, color: '#22e5d4', padding: '10px 14px', background: 'rgba(34,229,212,.08)', borderRadius: 8 }}>
                ✓ {DONE_LABEL[done]}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => { close(); onReportProblem(); }}
                  className="priv-opt"
                  style={privOptStyle}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true">🚩</span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Report a problem</span>
                    <span style={{ fontSize: 12, color: 'rgba(240,235,229,.5)' }}>Flag a privacy or data-handling concern</span>
                  </span>
                </button>

                {OPTIONS.map((opt) => (
                  <button
                    key={opt.kind}
                    onClick={() => submitKind(opt.kind)}
                    disabled={submitting}
                    className="priv-opt"
                    style={{ ...privOptStyle, borderColor: opt.danger ? 'rgba(255,80,41,.25)' : privOptStyle.borderColor }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true">{opt.kind === 'deletion' ? '🗑️' : opt.kind === 'detach' ? '⛓️' : '🔥'}</span>
                    <span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{opt.title}</span>
                      <span style={{ fontSize: 12, color: 'rgba(240,235,229,.5)' }}>{opt.desc}</span>
                    </span>
                  </button>
                ))}

                <button onClick={downloadExport} disabled={exporting} className="priv-opt" style={privOptStyle}>
                  <span style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true">⬇️</span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{exporting ? 'Preparing export…' : 'Download my data'}</span>
                    <span style={{ fontSize: 12, color: 'rgba(240,235,229,.5)' }}>Export everything iHYPE holds about you</span>
                  </span>
                </button>

                <Link href="/legal?tab=privacy" className="priv-opt" style={{ ...privOptStyle, textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true">📄</span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, marginBottom: 2 }}>Read the privacy policy</span>
                    <span style={{ fontSize: 12, color: 'rgba(240,235,229,.5)' }}>How we collect, use, and protect your data</span>
                  </span>
                </Link>

                {error && <p style={{ color: '#ff5029', fontSize: 12, marginTop: 8 }}>{error}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const privOptStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
  padding: '14px 16px', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10,
  background: 'var(--bg, #0a0805)', color: 'inherit', cursor: 'pointer', marginBottom: 10,
  fontFamily: 'var(--font-body)',
};
