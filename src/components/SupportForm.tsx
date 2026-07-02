'use client';

import { FormEvent, useState } from 'react';

async function postSupportRequest(body: unknown) {
  const response = await fetch('/api/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Could not send request.');
  }

  return payload;
}

export function SupportForm({ initialType = 'login', initialSubject = '' }: { initialType?: string; initialSubject?: string } = {}) {
  const [type, setType] = useState(initialType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [details, setDetails] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      await postSupportRequest({ type, name, email, subject, details, company });
      setMessage('Support request sent. The iHYPE team can now review it in the admin console.');
      setSubject('');
      setDetails('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form support-form" onSubmit={submit}>
      <label className="field">
        <span>What do you need help with?</span>
        <select onChange={(event) => setType(event.target.value)} value={type}>
          <option value="login">Login or MFA</option>
          <option value="verification">Artist or venue verification</option>
          <option value="copyright">Copyright or takedown</option>
          <option value="ticketing">Ticketing problem</option>
          <option value="safety">Safety or abuse report</option>
          <option value="privacy">Privacy or data concern</option>
          <option value="general">General support</option>
        </select>
      </label>

      <div className="auth-field-grid">
        <label className="field">
          <span>Name</span>
          <input onChange={(event) => setName(event.target.value)} type="text" value={name} />
        </label>
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
      </div>

      <label className="field">
        <span>Subject</span>
        <input onChange={(event) => setSubject(event.target.value)} required type="text" value={subject} />
      </label>

      <label className="field">
        <span>Details</span>
        <textarea
          maxLength={2500}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Tell us what happened and include profile, show, ticket, or email details if relevant."
          required
          rows={7}
          value={details}
        />
      </label>

      <label className="bot-field" aria-hidden="true">
        <span>Company</span>
        <input
          autoComplete="off"
          onChange={(event) => setCompany(event.target.value)}
          tabIndex={-1}
          type="text"
          value={company}
        />
      </label>

      <button className="button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Sending...' : 'Send support request'}
      </button>
      {message ? <p className="status-note">{message}</p> : null}
      {error ? <p className="status-note status-note-error">{error}</p> : null}
    </form>
  );
}
