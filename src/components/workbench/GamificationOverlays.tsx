'use client';

import React, { useEffect, useState } from 'react';
import { useGamificationOptional, GM_LEVELS } from './GamificationContext';

// ── Shared tokens ────────────────────────────────────────────
const AMBER = '#ffb84a';
const PINK = '#ff3e9a';
const TEAL = '#22e5d4';
const ACCENT = '#ff5029';

function popColor(c: 'pink' | 'amber' | 'teal') {
  return c === 'pink' ? PINK : c === 'teal' ? TEAL : AMBER;
}

// ── Floating XP Popups ────────────────────────────────────────
export function XPPopups() {
  const gm = useGamificationOptional();
  if (!gm) return null;
  return (
    <>
      <style>{`
        @keyframes gmFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: .8; }
          100% { opacity: 0; transform: translateY(-64px) scale(.85); }
        }
        .gm-pop {
          position: fixed; pointer-events: none;
          font-family: var(--f-d, 'Syne', sans-serif);
          font-weight: 800; font-size: 22px; letter-spacing: -.01em;
          z-index: 9000; text-shadow: 0 4px 14px rgba(0,0,0,.5);
          animation: gmFloat 1.2s ease-out forwards;
          transform-origin: center;
        }
      `}</style>
      {gm.popups.map(p => (
        <div
          key={p.id}
          className="gm-pop"
          style={{ color: popColor(p.color), left: p.x, top: p.y, marginLeft: '-1.5rem' }}
        >
          +{p.amt} XP
        </div>
      ))}
    </>
  );
}

// ── Combo Display ─────────────────────────────────────────────
export function ComboDisplay() {
  const gm = useGamificationOptional();
  const [visible, setVisible] = useState(false);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (gm?.showCombo != null) {
      setCombo(gm.showCombo);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 950);
      return () => clearTimeout(t);
    }
  }, [gm?.showCombo]);

  if (!visible || combo < 3) return null;
  const bonus = combo >= 10 ? '+25 XP BONUS' : combo >= 5 ? '+15 XP BONUS' : '+5 XP BONUS';

  return (
    <>
      <style>{`
        @keyframes gmCombo {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(.6); }
          30%  { opacity: 1; transform: translate(-50%,-50%) scale(1.08); }
          60%  { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(.9); }
        }
        .gm-combo-anim {
          animation: gmCombo .85s ease-out forwards;
        }
      `}</style>
      <div
        className="gm-combo-anim"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          pointerEvents: 'none', zIndex: 9001, textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800,
          fontSize: 54, letterSpacing: '-.02em', color: AMBER,
          textShadow: `0 0 28px rgba(255,184,74,.7), 0 8px 28px rgba(0,0,0,.6)`,
          WebkitTextStroke: '2px #0a0805',
        }}>{combo}× COMBO</div>
        <div style={{
          fontFamily: 'var(--f-m, monospace)', fontSize: 12, color: 'var(--ink, #f0ebe5)',
          letterSpacing: '.18em', fontWeight: 700, marginTop: 4,
        }}>{bonus}</div>
      </div>
    </>
  );
}

// ── Level-Up Overlay ──────────────────────────────────────────
export function LevelUpOverlay() {
  const gm = useGamificationOptional();
  if (!gm?.showLevelUp) return null;
  const level = gm.state.level;
  const name = GM_LEVELS[Math.min(level, GM_LEVELS.length - 1)] as string;
  const num = String(level).padStart(2, '0');

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(16px)',
        zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '2rem',
      }}
      onClick={gm.dismissLevelUp}
    >
      <div>
        <div style={{
          fontFamily: 'var(--f-m, monospace)', fontSize: 11, color: AMBER,
          letterSpacing: '.4em', fontWeight: 700, marginBottom: 8,
        }}>LEVEL UP</div>
        <div style={{
          fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800,
          fontSize: 'clamp(72px, 20vw, 128px)', letterSpacing: '-.04em', lineHeight: 1,
          background: `linear-gradient(135deg, ${AMBER}, ${ACCENT}, ${PINK})`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 28px rgba(255,184,74,.45))',
        }}>{num}</div>
        <div style={{
          fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800,
          fontSize: 'clamp(20px, 5vw, 34px)', letterSpacing: '-.025em', marginTop: 8,
          color: 'var(--ink, #f0ebe5)',
        }}>{name}</div>
        <div style={{
          fontFamily: 'var(--f-s, serif)', fontStyle: 'italic',
          fontSize: 16, color: 'var(--ink-2, #9e9080)', marginTop: 8,
          maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5,
        }}>Your ear is getting sharper. Keep hyping the artists you believe in.</div>
        <button
          onClick={gm.dismissLevelUp}
          style={{
            marginTop: 24, padding: '13px 32px', background: PINK, color: '#fff',
            borderRadius: 99, fontFamily: 'var(--f-m, monospace)', fontSize: 12,
            fontWeight: 700, letterSpacing: '.16em', border: 'none', cursor: 'pointer',
            minHeight: 44,
          }}
        >CONTINUE</button>
      </div>
    </div>
  );
}

// ── XP Footer Bar ─────────────────────────────────────────────
export function XPFooter({ visible }: { visible: boolean }) {
  const gm = useGamificationOptional();
  const [elapsed, setElapsed] = useState('0:00');

  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - (gm?.state.sessionStart ?? Date.now())) / 1000);
      const m = Math.floor(s / 60), ss = s % 60;
      setElapsed(`${m}:${String(ss).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [gm?.state.sessionStart]);

  if (!gm || !visible) return null;
  const { state } = gm;
  const pct = (state.xp % 1000) / 10;
  const level = state.level;
  const name = GM_LEVELS[Math.min(level, GM_LEVELS.length - 1)] as string;
  const nextName = GM_LEVELS[Math.min(level + 1, GM_LEVELS.length - 1)] as string;

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,.07)',
      padding: '9px 20px', display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: 16, alignItems: 'center',
      background: 'var(--bg-2, #100d09)', flexShrink: 0,
    }}>
      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${AMBER}, ${ACCENT})`,
          color: '#0a0805', fontFamily: 'var(--f-d, Syne, sans-serif)',
          fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: `0 4px 14px rgba(255,184,74,.28)`,
          flexShrink: 0,
        }}>{level}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 9, color: 'var(--ink-3, #5a5048)', letterSpacing: '.16em', fontWeight: 700 }}>LEVEL {level} · {name}</span>
          <span style={{ fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 700, fontSize: 12, letterSpacing: '-.005em', color: 'var(--ink, #f0ebe5)' }}>Next: <span style={{ color: AMBER }}>{nextName}</span></span>
        </div>
      </div>
      {/* XP bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 8, background: 'var(--bg-3, #1a1612)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${AMBER}, ${ACCENT}, ${PINK})`,
            borderRadius: 99, boxShadow: `0 0 10px rgba(255,184,74,.35)`,
            width: `${pct}%`, transition: 'width .5s cubic-bezier(.2,.7,.2,1)',
          }} />
        </div>
        <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 11, color: 'var(--ink, #f0ebe5)', letterSpacing: '.04em', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <b style={{ color: AMBER }}>{state.xp % 1000}</b> / 1,000 XP
        </span>
      </div>
      {/* Streak + session */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 13px', borderRadius: 99,
          background: 'rgba(255,80,41,.1)', border: `1px solid rgba(255,80,41,.26)`,
        }}>
          <span style={{ fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800, fontSize: 16, color: ACCENT, letterSpacing: '-.01em' }}>{state.streak}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 9, color: 'var(--ink-2, #9e9080)', letterSpacing: '.14em', fontWeight: 700 }}>DAY STREAK</span>
          </div>
        </div>
        <div style={{
          padding: '5px 10px', borderRadius: 99,
          background: 'rgba(34,229,212,.08)', border: `1px solid rgba(34,229,212,.18)`,
          fontFamily: 'var(--f-m, monospace)', fontSize: 10,
          color: TEAL, fontWeight: 600, letterSpacing: '.06em', whiteSpace: 'nowrap',
        }}>+ {elapsed}</div>
      </div>
    </div>
  );
}

// ── Daily Quest Bar ───────────────────────────────────────────
export function DailyQuestBar() {
  const gm = useGamificationOptional();
  if (!gm) return null;
  const { state } = gm;
  const pct = Math.min(100, state.questProgress / 5 * 100);
  const done = state.questProgress >= 5;

  return (
    <div style={{
      padding: '10px 20px',
      borderBottom: '1px solid rgba(255,255,255,.07)',
      display: 'flex', alignItems: 'center', gap: 16,
      background: 'linear-gradient(90deg, rgba(255,184,74,.05), transparent 70%)',
      flexShrink: 0,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: `linear-gradient(135deg, ${AMBER}, ${ACCENT})`,
        color: '#0a0805', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 16,
      }}>⚡</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 9, color: AMBER, letterSpacing: '.18em', fontWeight: 700 }}>DAILY QUEST</div>
        <div style={{ fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 700, fontSize: 13, letterSpacing: '-.005em', marginTop: 2, color: 'var(--ink, #f0ebe5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Hype 5 artists or shows from your scene
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 11, color: 'var(--ink, #f0ebe5)', fontWeight: 600 }}>
          <b style={{ color: AMBER }}>{state.questProgress}</b> / 5
        </span>
        <div style={{ width: 120, height: 7, background: 'var(--bg-3, #1a1612)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, ${AMBER}, ${ACCENT})`,
            borderRadius: 99, boxShadow: `0 0 8px rgba(255,184,74,.4)`,
            transition: 'width .4s ease',
          }} />
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 99,
          background: done ? 'rgba(34,229,212,.15)' : 'rgba(255,184,74,.12)',
          color: done ? TEAL : AMBER,
          fontFamily: 'var(--f-m, monospace)', fontSize: 10, fontWeight: 700,
          letterSpacing: '.1em',
          border: `1px solid ${done ? 'rgba(34,229,212,.3)' : 'rgba(255,184,74,.28)'}`,
          whiteSpace: 'nowrap',
        }}>{done ? '✓ DONE' : '+ 50 XP'}</div>
      </div>
    </div>
  );
}

// ── Level Pill (for nav bars) ─────────────────────────────────
export function GmLevelPill({ onClick }: { onClick?: () => void }) {
  const gm = useGamificationOptional();
  if (!gm) return null;
  const { state } = gm;
  const level = state.level;
  const name = GM_LEVELS[Math.min(level, GM_LEVELS.length - 1)] as string;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '4px 12px 4px 4px', borderRadius: 99,
        background: 'var(--bg-3, #1a1612)', border: '1px solid rgba(255,255,255,.13)',
        whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default',
        minHeight: 'unset',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 99,
        background: `linear-gradient(135deg, ${AMBER}, ${ACCENT})`,
        color: '#0a0805', fontFamily: 'var(--f-d, Syne, sans-serif)',
        fontWeight: 800, fontSize: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{String(level).padStart(2, '0')}</div>
      <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 10, color: 'var(--ink-2, #9e9080)', letterSpacing: '.1em', fontWeight: 600 }}>
        LVL&nbsp;·&nbsp;<b style={{ color: AMBER }}>{name}</b>
      </span>
    </button>
  );
}
