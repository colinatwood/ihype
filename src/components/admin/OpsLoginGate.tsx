'use client';
import { useState, useEffect, useRef } from 'react';

const STEPS = [
  'Attesting device',
  'Resolving operator role',
  'Satisfying MFA',
  'Minting session token',
  'Writing ledger entry',
  'Resuming automations',
];

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'OP';
}

type Phase = 'login' | 'provisioning' | 'done';

interface Props {
  name?: string | null;
  email?: string | null;
  children: React.ReactNode;
}

export function OpsLoginGate({ name, email, children }: Props) {
  const [phase, setPhase] = useState<Phase>('login');
  const [ready, setReady] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('ops_provisioned') === '1') {
      setPhase('done');
    }
    setReady(true);
  }, []);

  function startProvisioning() {
    setPhase('provisioning');
    setActiveStep(0);
    let step = 0;
    function tick() {
      setCompletedSteps(prev => [...prev, step]);
      step++;
      if (step < STEPS.length) {
        setActiveStep(step);
        timerRef.current = setTimeout(tick, 420 + Math.random() * 180);
      } else {
        setActiveStep(null);
        setTimeout(() => {
          sessionStorage.setItem('ops_provisioned', '1');
          setPhase('done');
        }, 600);
      }
    }
    timerRef.current = setTimeout(tick, 520);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!ready || phase === 'done') return <>{children}</>;

  const ops = initials(name, email);
  const displayName = name ?? email ?? 'Operator';
  const displayEmail = email ?? '';

  return (
    <div className="ops-gate">
      {phase === 'login' && (
        <div className="ops-login-card">
          <div className="ops-login-top">
            <span className="ops-wordmark">iH<span className="ops-dot">·</span><span className="ops-ops">OPS</span></span>
            <span className="ops-chip">OPERATOR</span>
          </div>

          <div className="ops-identity">
            <div className="ops-avatar">{ops}</div>
            <div className="ops-identity-text">
              <strong>{displayName}</strong>
              <span>{displayEmail}</span>
            </div>
          </div>

          <div className="ops-trust-facts">
            <div className="ops-trust-fact">
              <span className="ops-trust-label">Device</span>
              <span className="ops-trust-value ops-trust-ok">✓ Recognized</span>
            </div>
            <div className="ops-trust-fact">
              <span className="ops-trust-label">Passkey</span>
              <span className="ops-trust-value ops-trust-ok">✓ Registered</span>
            </div>
            <div className="ops-trust-fact">
              <span className="ops-trust-label">Role</span>
              <span className="ops-trust-value">OPERATOR</span>
            </div>
            <div className="ops-trust-fact">
              <span className="ops-trust-label">Session</span>
              <span className="ops-trust-value">8 h TTL</span>
            </div>
          </div>

          <p className="ops-login-sub">
            Sign-in is automated — your device and passkey are on file. No password required.
          </p>

          <button className="ops-cta" onClick={startProvisioning}>
            Continue with trusted device
          </button>

          <div className="ops-governance">
            <span>Public ledger · obfuscated to cohort_op_1</span>
            <span>Bans &gt;7 days require member vote</span>
          </div>
        </div>
      )}

      {phase === 'provisioning' && (
        <div className="ops-provisioning-card">
          <div className="ops-login-top">
            <span className="ops-wordmark">iH<span className="ops-dot">·</span><span className="ops-ops">OPS</span></span>
          </div>
          <p className="ops-prov-title">Setting up your session</p>
          <div className="ops-steps">
            {STEPS.map((step, i) => {
              const done = completedSteps.includes(i);
              const active = activeStep === i;
              return (
                <div key={step} className={`ops-step${done ? ' ops-step-done' : active ? ' ops-step-active' : ''}`}>
                  <span className="ops-step-icon">
                    {done ? '✓' : active ? <span className="ops-spin">⟳</span> : '○'}
                  </span>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
