'use client';

import React, { useEffect, useState } from 'react';
import { useGamification, GM_LEVELS } from './GamificationContext';

const AMBER = '#ffb84a';
const PINK = '#ff3e9a';
const TEAL = '#22e5d4';
const ACCENT = '#ff5029';
const PURPLE = '#b983ff';
const BLUE = '#7fb3ff';

const ACHIEVEMENTS = [
  { id: 'first_hype',  label: 'FIRST HYPE',   icon: '💜', color: PINK,   field: 'hyped' as const, threshold: 1 },
  { id: 'combo_10',    label: '10 COMBO',      icon: '⚡', color: AMBER,  field: 'bestCombo' as const, threshold: 10 },
  { id: 'streak_7',    label: '7-DAY FIRE',    icon: '🔥', color: ACCENT, field: 'streak' as const, threshold: 7 },
  { id: 'picked_hit',  label: 'PICKED A HIT',  icon: '📈', color: TEAL,   field: 'hyped' as const, threshold: 5 },
  { id: 'hundred',     label: '100 IN A DAY',  icon: '💯', color: AMBER,  field: 'hyped' as const, threshold: 100 },
  { id: 'scout',       label: 'SCOUT',         icon: '🔭', color: PURPLE, field: 'hyped' as const, threshold: 20 },
  { id: 'curator',     label: 'CURATOR',       icon: '🎯', color: PINK,   field: 'hyped' as const, threshold: 50 },
  { id: 'tastemaker',  label: 'TASTEMAKER',    icon: '👑', color: AMBER,  field: 'hyped' as const, threshold: 100 },
] as const;

type AchField = 'hyped' | 'bestCombo' | 'streak';

const LB_ROWS = [
  { rank: '01', initials: 'NK', name: 'Nikki K.',  sub: 'curator · 218 followers', pts: 2840, grad: `${ACCENT}, ${AMBER}`,   top: true },
  { rank: '02', initials: 'SR', name: 'Sade R.',   sub: 'scout · midwest',         pts: 2612, grad: `${PURPLE}, ${PINK}`,    top: false },
  { rank: '03', initials: 'MC', name: 'Marcus C.', sub: 'curator · chicago',        pts: 2401, grad: `${TEAL}, ${BLUE}`,     top: false },
  { rank: '17', initials: 'ME', name: 'You',        sub: '+ 4 spots this week',     pts: null,  grad: `${BLUE}, ${PURPLE}`,   top: false, isMe: true },
  { rank: '18', initials: 'EV', name: 'Eve V.',    sub: 'listener · lo-fi',         pts: 1798, grad: `${ACCENT}, ${PINK}`,   top: false },
];

const FEED = [
  { initials: 'SR', bg: PURPLE,  who: 'Sade R.',    action: 'hyped',           obj: 'Malia Torres',           when: '2m' },
  { initials: 'MC', bg: TEAL,    who: 'Marcus C.',  action: 'got +50 XP combo', obj: '',                      when: '7m' },
  { initials: 'NK', bg: AMBER,   who: 'Nikki K.',   action: 'unlocked',        obj: 'TASTEMAKER',             when: '14m' },
  { initials: 'EV', bg: ACCENT,  who: 'Eve V.',     action: 'hyped 3 shows in a row', obj: '',               when: '22m' },
];

function StatCard({ val, label, color }: { val: string | number; label: string; color: string }) {
  return (
    <div style={{ padding: '9px 11px', background: 'var(--bg-3, #1a1612)', borderRadius: 8, border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em', lineHeight: 1, color }}>{val}</div>
      <div style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 9, color: 'var(--ink-3, #5a5048)', letterSpacing: '.14em', fontWeight: 700, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Card({ title, chip, chipColor, children }: { title: string; chip?: string; chipColor?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-2, #100d09)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: '13px 14px', marginBottom: 10 }}>
      <div style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-3, #5a5048)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {title}
        {chip && <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700, letterSpacing: '.1em', background: `${chipColor ?? AMBER}22`, color: chipColor ?? AMBER }}>{chip}</span>}
      </div>
      {children}
    </div>
  );
}

export function ViewLeaderboard() {
  const { state } = useGamification();
  const [elapsed, setElapsed] = useState('0:00');

  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - state.sessionStart) / 1000);
      setElapsed(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [state.sessionStart]);

  const levelName = GM_LEVELS[Math.min(state.level, GM_LEVELS.length - 1)] as string;

  function fieldVal(f: AchField): number {
    if (f === 'hyped') return state.hyped;
    if (f === 'bestCombo') return state.bestCombo;
    if (f === 'streak') return state.streak;
    return 0;
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => fieldVal(a.field as AchField) >= a.threshold).length;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 10, color: AMBER, letterSpacing: '.2em', fontWeight: 700, marginBottom: 4 }}>LEADERBOARD</div>
        <div style={{ fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800, fontSize: 28, letterSpacing: '-.025em', color: 'var(--ink, #f0ebe5)', lineHeight: 1.1 }}>Your Hype Score</div>
        <div style={{ fontFamily: 'var(--f-b, sans-serif)', fontSize: 14, color: 'var(--ink-2, #9e9080)', marginTop: 6 }}>
          Level {state.level} · <span style={{ color: AMBER }}>{levelName}</span> · {state.streak}-day streak 🔥
        </div>
      </div>

      {/* Session Stats */}
      <Card title="This session" chip={`+ ${elapsed}`} chipColor={TEAL}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <StatCard val={state.hyped}    label="HYPED"      color={PINK} />
          <StatCard val={state.saved}    label="SAVED"      color={TEAL} />
          <StatCard val={state.xpEarned} label="XP EARNED"  color={AMBER} />
          <StatCard val={state.bestCombo}label="BEST COMBO" color={PURPLE} />
        </div>
      </Card>

      {/* Weekly Leaderboard */}
      <Card title="Weekly leaderboard" chip="RESET FRI" chipColor={AMBER}>
        {LB_ROWS.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: '18px 24px 1fr auto',
              gap: 8, alignItems: 'center',
              padding: r.isMe ? '6px 5px' : '6px 4px',
              borderBottom: i < LB_ROWS.length - 1 && !r.isMe ? '1px solid rgba(255,255,255,.07)' : 'none',
              background: r.isMe ? 'rgba(255,80,41,.06)' : 'transparent',
              borderRadius: r.isMe ? 7 : 0, margin: r.isMe ? '2px 0' : 0,
            }}
          >
            <span style={{ fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800, fontSize: 12, color: r.top ? AMBER : r.isMe ? ACCENT : 'var(--ink-3, #5a5048)', textAlign: 'center' }}>{r.rank}</span>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: `linear-gradient(135deg, ${r.grad})`, color: '#0a0805', fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.initials}</div>
            <div>
              <div style={{ fontFamily: 'var(--f-b, sans-serif)', fontSize: 11, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 9, color: 'var(--ink-3, #5a5048)', marginTop: 1, letterSpacing: '.04em' }}>{r.sub}</div>
            </div>
            <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 10, color: ACCENT, fontWeight: 700, letterSpacing: '.04em' }}>
              {r.isMe ? state.lbPts.toLocaleString() : r.pts?.toLocaleString()}
            </span>
          </div>
        ))}
      </Card>

      {/* Achievements */}
      <Card title="Achievements" chip={`${unlockedCount} / ${ACHIEVEMENTS.length}`} chipColor={PINK}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {ACHIEVEMENTS.map(a => {
            const got = fieldVal(a.field as AchField) >= a.threshold;
            return (
              <div
                key={a.id}
                title={a.label}
                style={{
                  aspectRatio: '1', borderRadius: 9,
                  background: got ? `${a.color}10` : 'var(--bg-3, #1a1612)',
                  border: `1px solid ${got ? `${a.color}50` : 'rgba(255,255,255,.07)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 3, padding: 5, cursor: 'default',
                  opacity: got ? 1 : .35,
                }}
              >
                <div style={{ fontSize: 15, lineHeight: 1 }}>{a.icon}</div>
                <div style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 8, color: got ? 'var(--ink, #f0ebe5)' : 'var(--ink-3, #5a5048)', letterSpacing: '.05em', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{a.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Friends activity */}
      <Card title="Friends' activity">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {FEED.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 3px', fontFamily: 'var(--f-b, sans-serif)', fontSize: 11, color: 'var(--ink-2, #9e9080)' }}>
              <div style={{ width: 18, height: 18, borderRadius: 99, flexShrink: 0, background: f.bg, color: '#0a0805', fontFamily: 'var(--f-d, Syne, sans-serif)', fontWeight: 800, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.initials}</div>
              <span>
                <span style={{ color: 'var(--ink, #f0ebe5)', fontWeight: 600 }}>{f.who}</span>
                {' '}{f.action}{' '}
                {f.obj && <span style={{ color: 'var(--ink, #f0ebe5)', fontWeight: 600 }}>{f.obj}</span>}
              </span>
              <span style={{ fontFamily: 'var(--f-m, monospace)', fontSize: 9, color: 'var(--ink-3, #5a5048)', letterSpacing: '.04em', marginLeft: 'auto', flexShrink: 0 }}>{f.when}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
