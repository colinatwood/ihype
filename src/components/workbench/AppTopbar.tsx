'use client';

import React from 'react';
import type { View } from './types';

export const TAB_ICONS: Record<string, React.ReactNode> = {
  me: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="6" r="2.5"/><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>,
  seeds: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2c2 3 4 4 4 7a4 4 0 1 1-8 0c0-3 2-4 4-7Z"/></svg>,
  radio: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r=".6" fill="currentColor"/></svg>,
  studio: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="12" height="8" rx="1.5"/><path d="M5 8h1M8 6v4M11 7v2"/></svg>,
  tickets: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6a1.5 1.5 0 0 0 0 3v3h12V9a1.5 1.5 0 0 0 0-3V3H2v3Z"/><path d="M9 3v10" strokeDasharray="1.4 1.4"/></svg>,
};

export const TABS: { k: View; label: string }[] = [
  { k: 'me',       label: 'My Page' },
  { k: 'seeds',    label: 'Seeds' },
  { k: 'radio',    label: 'Radio' },
  { k: 'studio',   label: 'Studio' },
  { k: 'tickets',  label: 'Ticketing' },
];

export function AppTopbar({ view, setView, listeningNow, initials, userName, activeProfileTypes, onSettings, badges, notifCount }: {
  view: View; setView: (v: View) => void;
  listeningNow: number; initials: string; userName: string;
  activeProfileTypes: string[]; onSettings: () => void;
  badges: Record<string, string | undefined>;
  notifCount: number;
}) {
  return (
    <header style={{
      height: 'var(--top-h)', borderBottom: '1px solid var(--line)',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center',
      gap: 24, padding: '0 22px',
      background: 'var(--bg-2)', position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', userSelect: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #ff3e9a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 14, color: '#0a0805',
          position: 'relative',
        }}>
          iH
          <span style={{ position: 'absolute', top: 5, right: 7, width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 18, letterSpacing: '-.03em', lineHeight: 1, color: 'var(--ink)', display: 'flex', alignItems: 'baseline', gap: 1 }}>
            iHYPE<span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', transform: 'translateY(-9px)', marginLeft: 1 }} />
          </div>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.18em', textTransform: 'uppercase', marginTop: 3 }}>workbench</div>
        </div>
      </div>

      {/* Tabs */}
      <nav role="navigation" aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
        {TABS.map(tab => {
          const active = view === tab.k;
          return (
            <button key={tab.k} onClick={() => setView(tab.k)} aria-current={active ? 'page' : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
              borderRadius: 8, cursor: 'pointer', border: 'none',
              color: active ? 'var(--ink)' : 'var(--ink-2)',
              background: 'transparent',
              fontFamily: 'var(--f-b)', fontWeight: 600, fontSize: 13, letterSpacing: '-.005em',
              position: 'relative', transition: 'color .15s, background .15s',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLButtonElement).style.color = active ? 'var(--ink)' : '#f0ebe5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = active ? 'var(--ink)' : 'var(--ink-2)'; }}
            >
              {TAB_ICONS[tab.k]}
              {tab.label}
              {badges[tab.k] && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99,
                  background: active ? 'rgba(255,80,41,.16)' : 'var(--bg-3)',
                  fontFamily: 'var(--f-m)', fontSize: 12,
                  color: active ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 700, letterSpacing: '.04em',
                }}>{badges[tab.k]}</span>
              )}
              {active && (
                <span style={{
                  position: 'absolute', left: 14, right: 14, bottom: 0, height: 2,
                  background: 'var(--accent)', borderRadius: '2px 2px 0 0',
                  boxShadow: '0 0 12px rgba(255,80,41,.6)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: listening + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--f-m)', fontSize: 13, color: 'var(--ink-2)', paddingRight: 14, borderRight: '1px solid var(--line)', marginRight: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22e5d4', boxShadow: '0 0 8px #22e5d4', animation: 'pulse 1.8s infinite', display: 'inline-block' }} />
          {listeningNow.toLocaleString()} listening
        </span>
        <button aria-label="Notifications" style={{
          position: 'relative', width: 32, height: 32, borderRadius: 7,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-2)',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 14, height: 14, borderRadius: 99, padding: '0 3px',
              background: '#ff3e9a', color: '#fff',
              fontFamily: 'var(--f-m)', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{notifCount > 9 ? '9+' : String(notifCount)}</span>
          )}
        </button>
        <button onClick={onSettings} aria-label="Open settings" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '5px 10px 5px 5px',
          borderRadius: 99, background: 'var(--bg-3)', border: '1px solid var(--line-2)',
          cursor: 'pointer', transition: 'border-color .15s',
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff3e9a, var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 13, color: '#0a0805',
          }}>{initials}</span>
          <div>
            <div style={{ fontFamily: 'var(--f-b)', fontWeight: 600, fontSize: 12, color: 'var(--ink)', lineHeight: 1 }}>{userName}</div>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.08em', marginTop: 2 }}>{activeProfileTypes.slice(0, 2).join(' + ')}</div>
          </div>
          <span style={{ padding: '3px 7px', borderRadius: 99, background: 'rgba(255,184,74,.12)', color: '#ffb84a', fontFamily: 'var(--f-m)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', border: '1px solid rgba(255,184,74,.28)' }}>LVL 14</span>
        </button>
      </div>
    </header>
  );
}
