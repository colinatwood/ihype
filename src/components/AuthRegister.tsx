'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { postJson } from '@/lib/api-client';
import { resolvePostAuthRedirect } from '@/lib/auth-redirects';
import {
  AuthSignalShell,
  getErrorMessage,
  getPasskeyDiagnostics,
  getStoredSignupVariant,
  roleOptions,
  trackSignupFunnel,
} from '@/components/AuthShared';
import type { AuthMethod, RegisterStep, RoleOption, SignupVariant } from '@/components/AuthShared';
import { TurnstileWidget } from '@/components/TurnstileWidget';

export function RegisterScreen({
  initialRole = 'FAN',
  inviteOnly = false
}: {
  initialRole?: RoleOption;
  inviteOnly?: boolean;
}) {
  const [role, setRole] = useState<RoleOption>(initialRole);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [signupVariant, setSignupVariant] = useState<SignupVariant>('email_first');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [step, setStep] = useState<RegisterStep>('form');
  const [createdAccountId, setCreatedAccountId] = useState('');
  const needsPublicName = role !== 'FAN';
  const needsUploadPolicy = role === 'ARTIST' || role === 'DJ';
  const selectedRole = useMemo(() => roleOptions.find((option) => option.value === role), [role]);

  useEffect(() => {
    const variant = getStoredSignupVariant();
    setSignupVariant(variant);
    setAuthMethod(variant === 'passkey_first' ? 'passkey' : 'email');
    trackSignupFunnel('view', { role: initialRole, method: variant === 'passkey_first' ? 'passkey' : 'email', step: 'form', variant });
  }, [initialRole]);

  function validateAccountForm() {
    if (!email.trim()) {
      throw new Error('Email is required so you can sign in with a magic link.');
    }
  }

  async function createAccountOnce() {
    validateAccountForm();

    if (createdAccountId) {
      return { id: createdAccountId };
    }

    const result = await postJson<{ id: string }>('/api/register', {
      name,
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      isThirteenOrOlder: acceptedAge,
      acceptedArtistUploadPolicy: needsUploadPolicy ? acceptedPolicy : true,
      inviteCode: inviteOnly ? inviteCode : undefined,
      company,
      passkeyFlow: authMethod === 'passkey',
      turnstileToken: turnstileToken || undefined,
    });

    setCreatedAccountId(result.id);
    trackSignupFunnel('account_created', { role, method: authMethod, step: 'register', variant: signupVariant });
    return result;
  }

  async function sendSignupMagicLink() {
    await postJson('/api/auth/magic-link', { email: email.trim() });
    setStep('magic-link-sent');
    setStatus('Account created. Check your inbox for a one-tap sign-in link.');
    trackSignupFunnel('login_magic_link_sent', { role, method: 'email', step: 'register', variant: signupVariant });
  }

  async function registerPasskeyForAccount(userId: string) {
    setStep('passkey');
    setStatus('Follow your device prompt. If it closes, retry here or finish with a magic link.');
    trackSignupFunnel('passkey_prompt', { role, method: 'passkey', step: 'register', variant: signupVariant, ...getPasskeyDiagnostics() });

    const optRes = await fetch(`/api/auth/passkey/register-first?userId=${userId}`);
    if (!optRes.ok) throw new Error('Could not start passkey setup.');
    const options = await optRes.json();
    trackSignupFunnel('passkey_prompt_ready', { role, method: 'passkey', step: 'register', variant: signupVariant, ...getPasskeyDiagnostics() });
    const credential = await startRegistration({ optionsJSON: options });
    const verifyRes = await postJson<{ redirect?: string }>('/api/auth/passkey/register-first', credential);
    trackSignupFunnel('passkey_success', { role, method: 'passkey', step: 'register', variant: signupVariant, ...getPasskeyDiagnostics() });
    window.location.href = resolvePostAuthRedirect(verifyRes.redirect);
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('');
    setIsSubmitting(true);
    let accountCreated = Boolean(createdAccountId);

    try {
      trackSignupFunnel('submit', { role, method: authMethod, step: 'form', variant: signupVariant });
      const result = await createAccountOnce();
      accountCreated = true;

      if (authMethod === 'passkey') {
        await registerPasskeyForAccount(result.id);
      } else {
        await sendSignupMagicLink();
      }
    } catch (err) {
      const reason = getErrorMessage(err, 'Could not create account.');
      trackSignupFunnel(authMethod === 'passkey' ? 'passkey_failed' : 'login_magic_link_failed', {
        role,
        method: authMethod,
        step: accountCreated ? step : 'form',
        reason,
        variant: signupVariant,
        ...(authMethod === 'passkey' ? getPasskeyDiagnostics(err) : {})
      });
      if (accountCreated) {
        setStep('passkey');
        setStatus('Your account was created. Retry the passkey prompt or use a magic link to finish signing in.');
      } else {
        setStep('form');
      }
      setError(reason);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function retryPasskey() {
    if (!createdAccountId) {
      setStep('form');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await registerPasskeyForAccount(createdAccountId);
    } catch (err) {
      const reason = getErrorMessage(err, 'Passkey setup was interrupted.');
      trackSignupFunnel('passkey_retry_failed', { role, method: 'passkey', step: 'register', reason, variant: signupVariant, ...getPasskeyDiagnostics(err) });
      setError(reason);
      setStatus('Retry the passkey prompt, or use a magic link to finish signing in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function useMagicLinkInstead() {
    setError('');
    setIsSubmitting(true);
    try {
      await sendSignupMagicLink();
    } catch (err) {
      const reason = getErrorMessage(err, 'Could not send a magic link.');
      trackSignupFunnel('login_magic_link_failed', { role, method: 'email', step: 'register', reason, variant: signupVariant });
      setError(reason);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSignalShell
      badge="Join iHYPE"
      cardSubtitle={
        step === 'passkey'
          ? 'Retry the device prompt or finish with a magic link. Your account is not stranded.'
          : step === 'magic-link-sent'
          ? 'Check your inbox for a one-tap link to finish signing in. You can add a passkey later from Settings.'
          : 'Pick your lane, then choose magic-link signup or passkey setup with a magic-link fallback.'
      }
      cardTitle="Create your account"
      description="One free account opens the ecosystem. Pick your role first, then build the page, shows, tickets, and discovery tools that match your lane."
      eyebrow="Free forever"
      highlight="Choose your lane."
      signals={[
        { label: 'Fans', value: 'Hype', detail: 'Discover and attend' },
        { label: 'Artists', value: 'Publish', detail: 'Media and tour signals' },
        { label: 'Rooms', value: 'Book', detail: 'Venue event tools' }
      ]}
      title="Join free."
      wide
    >
      {step === 'passkey' ? (
        <div className="auth-passkey-pending">
          <p>Waiting for your device passkey prompt.</p>
          <p className="subtitle">Use Face ID, Touch ID, or your device PIN when prompted.</p>
          <div className="auth-passkey-actions">
            <button className="button" disabled={isSubmitting} onClick={retryPasskey} type="button">
              {isSubmitting ? 'Opening prompt...' : 'Try passkey again'}
            </button>
            <button className="button secondary" disabled={isSubmitting} onClick={useMagicLinkInstead} type="button">
              Use a magic link instead
            </button>
          </div>
          <p className="meta">You can add a passkey later from Settings after signing in.</p>
        </div>
      ) : step === 'magic-link-sent' ? (
        <p className="status-note">Check your inbox for a sign-in link (expires in 15 min). You can close this tab.</p>
      ) : (
        <form className="form" onSubmit={createAccount}>
          <fieldset className="role-choice-grid">
            <legend>Account type</legend>
            {roleOptions.map((option) => (
              <label className={option.value === role ? 'role-choice active' : 'role-choice'} key={option.value}>
                <input
                  checked={option.value === role}
                  name="role"
                  onChange={() => {
                    setRole(option.value);
                    trackSignupFunnel('role_selected', { role: option.value, method: authMethod, step: 'form', variant: signupVariant });
                  }}
                  type="radio"
                  value={option.value}
                />
                <strong>{option.label}</strong>
                <span>{option.help}</span>
              </label>
            ))}
          </fieldset>

          <div className="auth-method-grid" role="tablist" aria-label="Signup method">
            <button
              aria-selected={authMethod === 'email'}
              className={authMethod === 'email' ? 'auth-method-choice active' : 'auth-method-choice'}
              onClick={() => {
                setAuthMethod('email');
                trackSignupFunnel('method_selected', { role, method: 'email', step: 'form', variant: signupVariant });
              }}
              type="button"
            >
              <strong>Magic link</strong>
              <span>Most reliable: one-tap link sent to your inbox.</span>
            </button>
            <button
              aria-selected={authMethod === 'passkey'}
              className={authMethod === 'passkey' ? 'auth-method-choice active' : 'auth-method-choice'}
              onClick={() => {
                setAuthMethod('passkey');
                trackSignupFunnel('method_selected', { role, method: 'passkey', step: 'form', variant: signupVariant });
              }}
              type="button"
            >
              <strong>Passkey</strong>
              <span>Use your device prompt now, with a magic link as backup.</span>
            </button>
          </div>

          <label className="field">
            <span>{needsPublicName ? (selectedRole?.label ?? 'Profile') + ' name' : 'Display name'}</span>
            <input
              onChange={(event) => setName(event.target.value)}
              placeholder={needsPublicName ? 'Your public artist/venue name' : 'Optional - shown on your profile'}
              required={needsPublicName}
              type="text"
              value={name}
            />
          </label>

          <div className="field-group-label">Sign-in email <span className="field-group-optional">- required so passkey setup can fall back safely</span></div>

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span>Phone</span>
            <input
              autoComplete="tel"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
              type="tel"
              value={phone}
            />
          </label>

          {inviteOnly ? (
            <label className="field">
              <span>Beta invite code</span>
              <input
                autoComplete="off"
                onChange={(event) => setInviteCode(event.target.value)}
                required
                type="text"
                value={inviteCode}
              />
            </label>
          ) : null}

          <label className="check-row">
            <input checked={acceptedAge} onChange={(event) => setAcceptedAge(event.target.checked)} required type="checkbox" />
            <span>
              I attest that I am 13 years of age or older and I recognize that iHYPE is not responsible for any
              content within.
            </span>
          </label>

          {needsUploadPolicy ? (
            <label className="check-row">
              <input
                checked={acceptedPolicy}
                onChange={(event) => setAcceptedPolicy(event.target.checked)}
                required
                type="checkbox"
              />
              <span>I confirm I am authorized to upload or use the music/media I add to iHYPE.</span>
            </label>
          ) : null}

          <TurnstileWidget
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
          />
          <button className="button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? 'Setting up...'
              : authMethod === 'passkey'
              ? 'Create account with passkey'
              : 'Create account with magic link'}
          </button>
          <div className="auth-trust-row" aria-label="Signup trust links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/community-rules">Community rules</Link>
          </div>
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
        </form>
      )}

      {status ? <p className="status-note">{status}</p> : null}
      {error ? <p className="status-note status-note-error">{error}</p> : null}
    </AuthSignalShell>
  );
}
