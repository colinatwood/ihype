'use client';
import { useState } from 'react';

export function BookingRequestButton({ profileId, profileName }: { profileId: string; profileName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const r = await fetch('/api/booking-requests', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ toProfileId: profileId, message }) });
    setStatus(r.ok ? 'sent' : 'error');
  }

  return (
    <>
      <button className="button small secondary" onClick={() => setOpen(true)}>Book / Inquire</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setOpen(false)}>
          <div className="panel" style={{ maxWidth: 420, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 className="title" style={{ fontSize: 18, marginBottom: 12 }}>Booking inquiry — {profileName}</h2>
            {status === 'sent' ? <p>Sent! The artist will be in touch.</p> : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea className="input" placeholder="Your message (dates, venue, offer…)" required rows={4} value={message} onChange={e => setMessage(e.target.value)} />
                {status === 'error' && <p className="meta" style={{ color: 'var(--error, red)' }}>Failed to send. Please try again.</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Sending…' : 'Send inquiry'}</button>
                  <button className="button secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
