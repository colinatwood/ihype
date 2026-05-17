'use client';

import { useRef, useState } from 'react';

const ADVERTISER_TYPES = [
  { value: 'artist', label: 'Artist / Band / DJ' },
  { value: 'venue', label: 'Concert Venue' },
  { value: 'promoter', label: 'Promoter / Booking Agent' },
  { value: 'label', label: 'Record Label / Publisher' },
  { value: 'music_store', label: 'Music Equipment / Instruments' },
  { value: 'other', label: 'Other (music industry)' },
];

export function AdSubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'approved' | 'review' | 'rejected' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch('/api/ads/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.status === 403) {
        setStatus('rejected');
        setReason(data.reason ?? '');
        setMessage(data.message ?? '');
      } else if (res.ok) {
        if (data.status === 'APPROVED') {
          setStatus('approved');
          setMessage(data.message);
          formRef.current?.reset();
        } else {
          setStatus('review');
          setMessage(data.message);
          formRef.current?.reset();
        }
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Submission failed.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="panel" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label className="label" htmlFor="advertiserName">Advertiser / Artist Name</label>
        <input className="input" id="advertiserName" name="advertiserName" required type="text" />
      </div>
      <div>
        <label className="label" htmlFor="advertiserType">Type</label>
        <select className="input" id="advertiserType" name="advertiserType">
          {ADVERTISER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="campaignWebsite">Website / Link</label>
        <input className="input" id="campaignWebsite" name="campaignWebsite" required type="url" placeholder="https://" />
      </div>
      <div>
        <label className="label" htmlFor="adTextCopy">Ad Copy <small>(max 280 chars)</small></label>
        <textarea className="input" id="adTextCopy" maxLength={280} name="adTextCopy" required rows={3} />
      </div>
      <div>
        <label className="label" htmlFor="creativeAsset">Creative Asset <small>(image, optional, max 5 MB)</small></label>
        <input accept="image/*" className="input" id="creativeAsset" name="creativeAsset" type="file" />
      </div>

      {status === 'approved' && (
        <div className="callout success">{message}</div>
      )}
      {status === 'review' && (
        <div className="callout warning">{message}</div>
      )}
      {status === 'rejected' && (
        <div className="callout error">
          <strong>Submission rejected</strong>
          <p>{message}</p>
          {reason && <p className="meta">{reason}</p>}
        </div>
      )}
      {status === 'error' && (
        <div className="callout error">{message}</div>
      )}

      <button className="button" disabled={status === 'submitting'} type="submit">
        {status === 'submitting' ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  );
}
