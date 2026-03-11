'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

type LoginChallenge = {
  email: string;
  password: string;
  challengeToken: string;
  expiresAt: string;
  requiresSetup: boolean;
  secret: string | null;
  otpauthUri: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  async function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const response = await fetch('/api/auth/mfa/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      setChallenge({
        email,
        password,
        challengeToken: data.challengeToken,
        expiresAt: data.expiresAt,
        requiresSetup: data.requiresSetup,
        secret: data.secret,
        otpauthUri: data.otpauthUri
      });
      setOtp('');
      setMessage(
        data.requiresSetup
          ? 'Add this account to your authenticator app, then enter the 6-digit code to finish logging in.'
          : 'Enter the 6-digit code from your authenticator app to finish logging in.'
      );
    } else {
      setMessage(data.error ?? 'Could not start login');
    }

    setPending(false);
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;

    setPending(true);
    setMessage(null);

    const result = await signIn('credentials', {
      email: challenge.email,
      password: challenge.password,
      otp,
      challengeToken: challenge.challengeToken,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      setMessage('Invalid or expired authentication code. Start over if the code window rolled over.');
      setPending(false);
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  function resetFlow() {
    setChallenge(null);
    setOtp('');
    setMessage(null);
  }

  return (
    <main className="container section">
      <div className="panel" style={{ padding: '1.5rem', maxWidth: 640 }}>
        <h1>Login</h1>
        <p className="kicker">
          Demo users: fan@ihype.org, dj@ihype.org, artist@ihype.org, venue@ihype.org. Password: demo12345. MFA is
          now required on every login, and first-time logins will prompt you to enroll an authenticator app.
        </p>

        {!challenge ? (
          <form className="form" onSubmit={handleStart}>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} name="email" type="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} name="password" type="password" required />
            </label>
            <button className="button" disabled={pending} type="submit">
              {pending ? 'Checking password...' : 'Continue to MFA'}
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleVerify}>
            {challenge.requiresSetup ? (
              <div className="empty">
                <strong>Authenticator setup required</strong>
                <p className="meta">Add a new TOTP account manually with this secret:</p>
                <div className="field" style={{ marginTop: '0.75rem' }}>
                  <input readOnly value={challenge.secret ?? ''} />
                </div>
                <p className="meta" style={{ marginTop: '0.75rem' }}>
                  If your authenticator supports QR/URI import, you can also use this otpauth URI:
                </p>
                <div className="field" style={{ marginTop: '0.75rem' }}>
                  <textarea readOnly rows={3} value={challenge.otpauthUri ?? ''} />
                </div>
              </div>
            ) : null}

            <label className="field">
              <span>6-digit authentication code</span>
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                minLength={6}
                onChange={(event) => setOtp(event.target.value)}
                pattern="[0-9]{6}"
                placeholder="123456"
                required
                value={otp}
              />
            </label>

            <div className="cta-row">
              <button className="button" disabled={pending} type="submit">
                {pending ? 'Verifying...' : 'Sign in'}
              </button>
              <button className="button secondary" disabled={pending} onClick={resetFlow} type="button">
                Start over
              </button>
            </div>

            <p className="meta">Challenge expires at {new Date(challenge.expiresAt).toLocaleTimeString('en-US')}.</p>
          </form>
        )}

        {message ? <p className="meta" style={{ marginTop: '1rem' }}>{message}</p> : null}
      </div>
    </main>
  );
}
