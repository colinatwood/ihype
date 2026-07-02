'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  showTitle: string;
  startsAt: string;
  canCancel: boolean;
}

type Modal = 'transfer' | 'cancel' | null;

export function TicketActions({ orderId, showTitle, startsAt, canCancel }: Props) {
  const [modal, setModal] = useState<Modal>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  async function transfer() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${orderId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Transfer failed');
        return;
      }
      setDone('Transferred. The recipient has been emailed their tickets.');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancel() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${orderId}/refund`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Cancellation request failed');
        return;
      }
      setDone('Cancellation requested — our support team will confirm your refund shortly.');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setModal(null);
    setEmail('');
    setError(null);
    setDone(null);
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setModal('transfer')} className="ihype-btn-ghost" style={{ fontSize: 12 }}>
          Transfer
        </button>
        {canCancel ? (
          <button onClick={() => setModal('cancel')} className="ihype-btn-ghost" style={{ fontSize: 12, color: '#ff5029' }}>
            Cancel ticket
          </button>
        ) : (
          <span style={{ fontSize: 11, color: 'rgba(240,235,229,.35)', fontFamily: 'var(--font-mono)', alignSelf: 'center' }}>
            Cancellation closes 48h before the show — transfer instead
          </span>
        )}
      </div>

      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          style={{
            position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: 'var(--bg-2, #100d09)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 12, padding: 28, maxWidth: 420, width: '100%',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              {modal === 'transfer' ? 'Transfer tickets' : 'Cancel tickets'}
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(240,235,229,.6)', marginBottom: 16 }}>
              {showTitle} · {new Date(startsAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>

            {done ? (
              <>
                <p style={{ fontSize: 13, color: '#22e5d4', marginBottom: 16 }}>{done}</p>
                <button onClick={closeModal} className="ihype-btn-primary" style={{ width: '100%' }}>Close</button>
              </>
            ) : modal === 'transfer' ? (
              <>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(240,235,229,.5)', marginBottom: 6 }}>
                  Recipient&apos;s email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ihype-input"
                  placeholder="friend@example.com"
                  style={{ width: '100%', marginBottom: 16 }}
                />
                {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={closeModal} className="ihype-btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={transfer} disabled={submitting || !email} className="ihype-btn-primary" style={{ flex: 1 }}>
                    {submitting ? 'Transferring…' : 'Transfer'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'rgba(240,235,229,.7)', marginBottom: 16 }}>
                  This submits a cancellation/refund request to our support team. Your tickets stay valid until it&apos;s confirmed.
                </p>
                {error && <p style={{ color: '#ff5029', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={closeModal} className="ihype-btn-ghost" style={{ flex: 1 }}>Keep tickets</button>
                  <button onClick={cancel} disabled={submitting} className="ihype-btn-primary" style={{ flex: 1 }}>
                    {submitting ? 'Submitting…' : 'Request cancellation'}
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
