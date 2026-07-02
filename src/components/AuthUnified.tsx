'use client';

import Link from 'next/link';
import type { CSSProperties, FormEvent } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { postJson } from '@/lib/api-client';
import { resolvePostAuthRedirect } from '@/lib/auth-redirects';
import { getErrorMessage, trackSignupFunnel } from '@/components/AuthShared';
import type { RoleOption } from '@/components/AuthShared';

type Mode = 'signin' | 'signup';
type Step = 'form' | 'passcode';

const ROLE_COLORS: Record<RoleOption, string> = {
  FAN: '#b983ff',
  ARTIST: '#ff5029',
  VENUE: '#22e5d4',
  DJ: '#ff3e9a',
};

const ROLE_ORDER: RoleOption[] = ['FAN', 'ARTIST', 'VENUE', 'DJ'];
const ROLE_LABELS: Record<RoleOption, string> = {
  FAN: 'Fan',
  ARTIST: 'Artist',
  VENUE: 'Venue',
  DJ: 'DJ',
};

export function AuthUnified({
  initialMode,
  inviteOnly = false,
  initialRole = 'FAN',
  initialEmail = '',
  justRegistered = false,
}: {
  initialMode: Mode;
  inviteOnly?: boolean;
  initialRole?: RoleOption;
  initialEmail?: string;
  justRegistered?: boolean;
}) {
  const searchParams = useSearchParams();
  const queryMode = searchParams.get('mode') === 'signup' ? 'signup' : searchParams.get('mode') === 'signin' ? 'signin' : null;
  const [mode, setMode] = useState<Mode>(queryMode ?? initialMode);
  const [step, setStep] = useState<Step>('form');
  const [role, setRole] = useState<RoleOption>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  function setModeAndReset(m: Mode) {
    setMode(m);
    setStep('form');
    setError('');
    setMagicLinkSent(false);
  }

  async function requestPasscode() {
    const payload = await postJson<{ challengeId: string; email?: string | null }>('/api/auth/otp/request', {
      identifier: email.trim(),
      password,
      inviteCode: mode === 'signup' && inviteOnly ? inviteCode : undefined,
    });
    setChallengeId(payload.challengeId);
    setPasscode('');
    setStep('passcode');
  }

  async function submitAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        trackSignupFunnel('submit', { role, method: 'email', step: 'form' });
        await postJson('/api/register', {
          name: name.trim() || undefined,
          email: email.trim(),
          password,
          role,
          inviteCode: inviteOnly ? inviteCode : undefined,
        });
        trackSignupFunnel('account_created', { role, method: 'email', step: 'register' });
      }
      await requestPasscode();
    } catch (err) {
      setError(getErrorMessage(err, mode === 'signup' ? 'Could not create account.' : 'Could not sign in.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyPasscode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload = await postJson<{ redirect?: string }>('/api/auth/otp/signin', { challengeId, otp: passcode });
      trackSignupFunnel(mode === 'signup' ? 'email_code_success' : 'login_otp_success', { role, method: 'email', step: mode === 'signup' ? 'register' : 'login' });
      window.location.href = resolvePostAuthRedirect(payload.redirect);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not verify that code.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function magicLink() {
    setError('');
    setIsSubmitting(true);
    try {
      await postJson('/api/auth/magic-link', { email: email.trim() });
      setMagicLinkSent(true);
      trackSignupFunnel('login_magic_link_sent', { method: 'email', step: mode === 'signup' ? 'register' : 'login' });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send link. Try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const signup = mode === 'signup';

  return (
    <div className="auth-wrap">
      <div className="auth-eyebrow">{signup ? 'JOIN THE SCENE' : 'WELCOME BACK'}</div>
      <h1 className="auth-title">{signup ? 'Create account.' : 'Sign in.'}</h1>
      <p className="auth-sub">{signup ? 'Zero fees. 45/45/10. iHYPE takes nothing.' : 'Pick up where you left off.'}</p>

      {justRegistered && step === 'form' && (
        <p className="auth-status">Account created — check your inbox for your sign-in code.</p>
      )}

      {step === 'passcode' ? (
        <form className="auth-form" onSubmit={verifyPasscode}>
          <p className="auth-status">Enter the 6-digit code sent to {email}.</p>
          <div className="auth-field">
            <label>6-digit code</label>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              type="text"
              value={passcode}
            />
          </div>
          <button className="auth-btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Verifying…' : 'Verify code'}
          </button>
          <button className="auth-btn-ghost" disabled={isSubmitting} onClick={() => requestPasscode().catch((err) => setError(getErrorMessage(err, 'Could not resend code.')))} type="button">
            Send a new code
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      ) : (
        <>
          <div className="auth-toggle">
            <button className={!signup ? 'active' : ''} onClick={() => setModeAndReset('signin')} type="button">Sign In</button>
            <button className={signup ? 'active' : ''} onClick={() => setModeAndReset('signup')} type="button">Create Account</button>
          </div>

          <form className="auth-form" onSubmit={submitAuth}>
            {signup && (
              <div className="auth-field">
                <label>Your name</label>
                <input onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" type="text" value={name} />
              </div>
            )}

            <div className="auth-field">
              <label>Email</label>
              <input autoComplete="email" onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required type="email" value={email} />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required type="password" value={password} />
            </div>

            {signup && inviteOnly && (
              <div className="auth-field">
                <label>Beta invite code</label>
                <input autoComplete="off" onChange={(e) => setInviteCode(e.target.value)} required type="text" value={inviteCode} />
              </div>
            )}

            {signup && (
              <div className="auth-field">
                <label>I&apos;m joining as</label>
                <div className="auth-role-grid">
                  {ROLE_ORDER.map((value) => {
                    const c = ROLE_COLORS[value];
                    const selected = role === value;
                    return (
                      <div
                        className={selected ? 'auth-role-opt sel' : 'auth-role-opt'}
                        key={value}
                        onClick={() => setRole(value)}
                        style={selected ? ({ '--role-c': c, '--role-bg': `${c}1a` } as CSSProperties) : undefined}
                      >
                        <div className="auth-role-dot" style={{ background: c }} />
                        <div className="auth-role-name">{ROLE_LABELS[value]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="auth-btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? (signup ? 'Creating account…' : 'Signing in…') : (signup ? 'Create account' : 'Sign In')}
            </button>
          </form>

          <div className="auth-divider">or</div>
          {magicLinkSent ? (
            <p className="auth-status">Check your inbox for a sign-in link (expires in 15 min).</p>
          ) : (
            <button className="auth-btn-ghost" disabled={isSubmitting} onClick={magicLink} type="button">
              Email me a magic link
            </button>
          )}

          {error && <p className="auth-error">{error}</p>}

          {!signup && (
            <>
              <div className="auth-fine">
                New to iHYPE? <a href="#" onClick={(e) => { e.preventDefault(); setModeAndReset('signup'); }}>Create an account</a>
              </div>
              <div className="auth-fine" style={{ marginTop: 10 }}>
                <Link href="/forgot">Forgot password?</Link>
              </div>
            </>
          )}

          <div className="auth-charter-note">iHYPE takes nothing · locked in the charter</div>
        </>
      )}

      <style>{`
        .auth-wrap { width: min(440px, calc(100% - 3rem)); margin: 0 auto; padding: 56px 0 80px; }
        .auth-eyebrow { font-family: var(--f-m, 'JetBrains Mono', monospace); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; text-align: center; }
        .auth-title { font-family: var(--f-d, 'Syne', sans-serif); font-size: clamp(28px,6vw,40px); font-weight: 800; letter-spacing: -.03em; line-height: 1; text-align: center; margin-bottom: 8px; color: var(--ink); }
        .auth-sub { font-size: 14px; color: rgba(240,235,229,.55); text-align: center; margin-bottom: 32px; }
        .auth-status { font-size: 13px; color: var(--ink-2); text-align: center; margin-bottom: 16px; }
        .auth-error { font-size: 13px; color: var(--accent); text-align: center; margin-top: 12px; }
        .auth-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 4px; margin-bottom: 28px; }
        .auth-toggle button { padding: 11px; border: none; background: transparent; color: rgba(240,235,229,.55); font-family: var(--f-b, 'DM Sans', sans-serif); font-size: 14px; font-weight: 500; border-radius: 9px; cursor: pointer; transition: all 160ms cubic-bezier(.2,.7,.3,1); }
        .auth-toggle button.active { background: rgba(255,80,41,.12); color: var(--ink); box-shadow: inset 0 0 0 1px rgba(255,80,41,.3); }
        .auth-field { margin-bottom: 16px; }
        .auth-field label { display: block; font-family: var(--f-m, 'JetBrains Mono', monospace); font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: .14em; color: rgba(240,235,229,.55); margin-bottom: 7px; }
        .auth-field input { width: 100%; padding: 13px 14px; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; background: rgba(255,255,255,.03); color: var(--ink); font-family: var(--f-b, 'DM Sans', sans-serif); font-size: 15px; transition: border-color 150ms; }
        .auth-field input:focus { outline: none; border-color: rgba(255,80,41,.45); }
        .auth-field input::placeholder { color: rgba(240,235,229,.3); }
        .auth-role-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
        @media (max-width: 480px) { .auth-role-grid { grid-template-columns: 1fr 1fr; } }
        .auth-role-opt { padding: 12px 6px; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; background: rgba(255,255,255,.03); cursor: pointer; text-align: center; transition: all 150ms cubic-bezier(.2,.7,.3,1); }
        .auth-role-opt:hover { border-color: rgba(255,255,255,.18); }
        .auth-role-opt.sel { border-color: var(--role-c, #ff5029); background: var(--role-bg, rgba(255,80,41,.1)); }
        .auth-role-dot { width: 8px; height: 8px; border-radius: 50%; margin: 0 auto 7px; }
        .auth-role-name { font-family: var(--f-d, 'Syne', sans-serif); font-size: 12px; font-weight: 800; letter-spacing: -.01em; color: var(--ink); }
        .auth-btn-primary { width: 100%; padding: 14px; border: none; background: var(--accent); color: #fff; border-radius: 10px; font-family: var(--f-d, 'Syne', sans-serif); font-weight: 800; font-size: 15px; cursor: pointer; transition: opacity 150ms; margin-top: 8px; }
        .auth-btn-primary:hover { opacity: .9; }
        .auth-btn-primary:disabled { opacity: .6; cursor: default; }
        .auth-btn-ghost { width: 100%; padding: 13px; border: 1px solid rgba(255,255,255,.1); background: transparent; color: rgba(240,235,229,.7); border-radius: 10px; font-family: var(--f-b, 'DM Sans', sans-serif); font-size: 14px; cursor: pointer; transition: all 150ms; }
        .auth-btn-ghost:hover { background: rgba(255,255,255,.04); color: var(--ink); }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; color: rgba(240,235,229,.3); font-family: var(--f-m, 'JetBrains Mono', monospace); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.08); }
        .auth-fine { text-align: center; font-size: 13px; color: rgba(240,235,229,.5); margin-top: 22px; }
        .auth-fine a { color: var(--accent); text-decoration: none; cursor: pointer; }
        .auth-fine a:hover { text-decoration: underline; }
        .auth-charter-note { text-align: center; font-family: var(--f-m, 'JetBrains Mono', monospace); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: rgba(240,235,229,.3); margin-top: 32px; }
      `}</style>
    </div>
  );
}
