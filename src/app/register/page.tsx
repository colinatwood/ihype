'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setMessage(
      response.ok
        ? data.profilePath
          ? `Account created. Your page is ready at ${data.profilePath} after login, and your first login will set up MFA.`
          : 'Account created. Your first login will set up MFA.'
        : data.error ?? 'Registration failed'
    );
  }

  return (
    <main className="container section">
      <div className="panel" style={{ padding: '1.5rem', maxWidth: 640 }}>
        <h1>Create account</h1>
        <p className="kicker">Every account now uses authenticator-app MFA. After registration, your first login will walk you through setup.</p>
        <form className="form" action={handleSubmit}>
          <div className="grid grid-2">
            <label className="field"><span>Name</span><input name="name" required /></label>
            <label className="field"><span>Email</span><input name="email" type="email" required /></label>
          </div>
          <div className="grid grid-2">
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" minLength={8} required />
            </label>
            <label className="field">
              <span>Role</span>
              <select name="role" defaultValue="FAN">
                <option value="FAN">Listener</option>
                <option value="ARTIST">Artist</option>
                <option value="DJ">Promoter</option>
                <option value="VENUE">Venue</option>
              </select>
            </label>
          </div>
          <button className="button" type="submit">Create account</button>
          {message ? <p className="meta">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
