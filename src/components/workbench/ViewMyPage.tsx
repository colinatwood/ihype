'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { WorkbenchData, WbTicket } from '@/types/workbench';
import { IcHeart, IcCheck } from './icons';
import { Panel, TrackCard } from './primitives';

const STUB_ACCENT_PALETTE = ['#ff5029', '#b983ff', '#22e5d4', '#ff3e9a', '#ffb84a', '#4af0b0'];

// ── Hype Button (matches prototype) ────────────────────────────
function HypeBtn({
  id, hyped, count, onHype, large,
}: { id: string; hyped: boolean; count?: number | string; onHype: (id: string) => void; large?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onHype(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: large ? '12px 24px' : '8px 16px',
        borderRadius: 99,
        fontSize: large ? 15 : 13,
        fontWeight: 600, fontFamily: 'var(--f-b)',
        border: hyped ? '2px solid transparent' : '2px solid rgba(255,80,41,.5)',
        background: hyped
          ? 'linear-gradient(135deg,#ff5029 0%,#ff3e9a 50%,#22e5d4 100%)'
          : hover
          ? 'linear-gradient(135deg,#ff5029 0%,#ff3e9a 50%,#22e5d4 100%)'
          : 'rgba(255,80,41,.1)',
        color: hyped || hover ? '#fff' : 'var(--accent)',
        boxShadow: hyped ? '0 4px 20px rgba(255,80,41,.4)' : hover ? '0 8px 28px rgba(255,80,41,.35)' : 'none',
        transform: hover && !hyped ? 'translateY(-2px)' : 'none',
        transition: 'all .22s',
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        minHeight: 'unset',
      }}
    >
      <svg width={large ? 15 : 12} height={large ? 15 : 12} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
      <span style={{ position: 'relative', zIndex: 1 }}>
        {count !== undefined ? (
          <span style={{ fontFamily: 'var(--f-m)', fontSize: large ? 13 : 11, opacity: .85 }}>{count}</span>
        ) : (
          hyped ? 'Hyped!' : 'Hype'
        )}
      </span>
    </button>
  );
}

// ── Entity Card (artist/venue card from prototype) ──────────────
const COVER_GRADIENTS = [
  'linear-gradient(135deg,#c83a18,#e89060)',
  'linear-gradient(135deg,#1a8278,#7fc4c0)',
  'linear-gradient(135deg,#7a3fb5,#c08fe8)',
  'linear-gradient(135deg,#3a60c8,#90bce8)',
  'linear-gradient(135deg,#c03080,#f0a0d0)',
  'linear-gradient(135deg,#2a7a3a,#6fc08e)',
];

function EntityCard({
  name, sub, type, hypeCount, gradientIdx, onHype, onProfile,
}: {
  name: string; sub: string; type: string; hypeCount: number; gradientIdx: number;
  onHype: (id: string) => void; onProfile?: () => void;
}) {
  const [hyped, setHyped] = useState(false);
  const [count, setCount] = useState(hypeCount);
  const [hover, setHover] = useState(false);

  const handleHype = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hyped) return;
    setHyped(true);
    setCount(c => c + 1);
    onHype(name);
  };

  return (
    <div
      onClick={onProfile}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-2)', border: '1px solid var(--line-2)',
        borderRadius: 18, overflow: 'hidden',
        transform: hover ? 'translateY(-3px)' : 'none',
        borderColor: hover ? 'var(--line-3)' : 'var(--line-2)',
        transition: 'transform .2s, border-color .2s',
        cursor: onProfile ? 'pointer' : 'default',
      }}
    >
      {/* Cover */}
      <div style={{
        height: 130, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '10px 12px',
        background: COVER_GRADIENTS[gradientIdx % COVER_GRADIENTS.length],
      }}>
        <span style={{
          fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
          background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)',
          padding: '3px 8px', borderRadius: 99, color: '#fff', fontWeight: 600,
          border: '1px solid rgba(255,255,255,.12)', position: 'relative', zIndex: 2,
        }}>{type}</span>
      </div>
      {/* Body */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'var(--f-d)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.005em' }}>{name}</div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>
        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontFamily: 'var(--f-d)', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{count.toLocaleString()}</div>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 1 }}>hypes</div>
          </div>
          <HypeBtn id={name} hyped={hyped} onHype={() => handleHype({ stopPropagation: () => {} } as React.MouseEvent)} />
        </div>
      </div>
    </div>
  );
}

// ── Track Row (matches prototype) ───────────────────────────────
function TrackRow({ num, title, artist, duration }: { num: number; title: string; artist: string; duration: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '28px 1fr auto auto',
        gap: 10, alignItems: 'center', padding: '10px 12px',
        borderRadius: 12,
        background: hover ? 'rgba(255,80,41,.03)' : 'var(--bg-2)',
        border: `1px solid ${hover ? 'var(--line-2)' : 'var(--line)'}`,
        transition: 'border-color .15s, background .15s', cursor: 'pointer',
      }}
    >
      <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-4)', textAlign: 'center' }}>{num}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{artist}</div>
      </div>
      <span style={{
        fontFamily: 'var(--f-m)', fontSize: 9, padding: '2px 6px',
        borderRadius: 99, background: 'rgba(34,229,212,.08)',
        border: '1px solid rgba(34,229,212,.22)', color: '#22e5d4',
        fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
      }}>FREE</span>
      <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)' }}>{duration}</div>
    </div>
  );
}

// ── Show Card (matches prototype show-card) ─────────────────────
function ShowCard({
  date, title, meta, badge, badgeType, hypeCount, onHype,
}: {
  date: string; title: string; meta: string; badge: string; badgeType: 'free' | 'ticketed';
  hypeCount: number; onHype?: () => void;
}) {
  const [hyped, setHyped] = useState(false);
  const [count, setCount] = useState(hypeCount);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 18,
        padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr auto',
        gap: 14, alignItems: 'center', cursor: 'pointer',
        borderColor: hover ? 'var(--line-3)' : 'var(--line-2)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'border-color .15s, transform .15s',
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 5 }}>{date}</div>
        <div style={{ fontFamily: 'var(--f-d)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 5 }}>{title}</div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5 }}>{meta}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--f-m)', fontSize: 10, padding: '3px 8px', borderRadius: 99,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0,
          background: badgeType === 'free' ? 'rgba(34,229,212,.1)' : 'rgba(255,80,41,.1)',
          border: badgeType === 'free' ? '1px solid rgba(34,229,212,.25)' : '1px solid rgba(255,80,41,.25)',
          color: badgeType === 'free' ? '#22e5d4' : '#ff5029',
        }}>{badge}</span>
        <button
          onClick={e => {
            e.stopPropagation();
            if (hyped) return;
            setHyped(true);
            setCount(c => c + 1);
            onHype?.();
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 99, fontSize: 12, fontWeight: 600, fontFamily: 'var(--f-b)',
            border: hyped ? '2px solid transparent' : '2px solid rgba(255,80,41,.5)',
            background: hyped ? 'linear-gradient(135deg,#ff5029,#ff3e9a)' : 'rgba(255,80,41,.1)',
            color: hyped ? '#fff' : 'var(--accent)',
            transition: 'all .22s', cursor: 'pointer', minHeight: 'unset',
          }}
        >
          <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>
          <span style={{ fontFamily: 'var(--f-m)', fontSize: 11 }}>{count.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
}

// ── Sidebar cards ───────────────────────────────────────────────
function SidebarCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 18, padding: '16px 18px', marginBottom: 12 }}>
      {title && <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 14 }}>{title}</div>}
      {children}
    </div>
  );
}

// ── Hype Activity Bar Row ───────────────────────────────────────
function HypeBarRow({ label, pct, count }: { label: string; pct: number; count: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 32px', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <div style={{ fontFamily: 'var(--f-m)', color: 'var(--ink-2)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ height: 5, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#22e5d4', borderRadius: 3 }} />
      </div>
      <div style={{ fontFamily: 'var(--f-m)', color: 'var(--ink-3)', fontSize: 11, textAlign: 'right' }}>{count}</div>
    </div>
  );
}

// ── Tag pill ────────────────────────────────────────────────────
function Tag({ children, variant }: { children: React.ReactNode; variant?: 'artist' | 'venue' | 'fan' | 'promoter' }) {
  const colors: Record<string, { bg: string; border: string; color: string }> = {
    artist:   { bg: 'rgba(255,80,41,.12)',  border: 'rgba(255,80,41,.25)',  color: '#ff5029' },
    venue:    { bg: 'rgba(34,229,212,.1)',  border: 'rgba(34,229,212,.22)', color: '#22e5d4' },
    fan:      { bg: 'rgba(185,131,255,.12)',border: 'rgba(185,131,255,.25)',color: '#b983ff' },
    promoter: { bg: 'rgba(255,62,154,.1)',  border: 'rgba(255,62,154,.25)', color: '#ff3e9a' },
  };
  const s = variant ? colors[variant] : { bg: 'var(--surface)', border: 'var(--line)', color: 'var(--ink-2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 99, background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>{children}</span>
  );
}

// ── Ticket Stub (unchanged from before) ────────────────────────
function TicketStubQR({ code }: { code: string }) {
  const cells = Array.from({ length: 16 }, (_, i) => {
    const ch = code.charCodeAt(i % code.length);
    return (ch + i) % 2 === 0;
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, width: 40, height: 40, flexShrink: 0 }}>
      {cells.map((on, i) => (
        <div key={i} style={{ borderRadius: 1, background: on ? 'var(--accent)' : 'var(--bg-3)' }} />
      ))}
    </div>
  );
}

function TicketStub({ ticket, accentColor }: { ticket: WbTicket; accentColor: string }) {
  const dateStr = new Date(ticket.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div style={{
      position: 'relative', display: 'flex', borderRadius: '8px 8px 0 0',
      border: '1px solid var(--line-2)', borderBottom: '2px dashed var(--line-2)',
      background: `repeating-linear-gradient(135deg, var(--bg-2) 0px, var(--bg-2) 8px, var(--bg-3) 8px, var(--bg-3) 9px)`,
      overflow: 'hidden', minHeight: 90,
    }}>
      <div style={{ width: 4, background: accentColor, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '10px 12px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>{ticket.showName}</div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>{dateStr}</div>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Chicago, IL · {ticket.seat}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '.18em', textTransform: 'uppercase', marginTop: 8 }}>
          iHYPE • NO PLATFORM FEE • 45/45/10
        </div>
      </div>
      <div style={{ width: 1, borderLeft: '2px dashed var(--line-2)', margin: '8px 0', flexShrink: 0 }} />
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <TicketStubQR code={ticket.code} />
      </div>
    </div>
  );
}

// ── Artist Profile Drawer ───────────────────────────────────────
function ArtistProfileDrawer({
  name, sub, gradientIdx, onClose,
}: { name: string; sub: string; gradientIdx: number; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const [hyped, setHyped] = useState(false);
  const tabs = ['About', 'Music', 'Shows'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} />
      {/* Drawer */}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 700,
        height: '92vh', background: 'var(--bg-2)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid var(--line-2)', borderBottom: 'none',
        overflowY: 'auto',
        animation: 'slideUp .35s cubic-bezier(.22,1,.36,1) both',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }`}</style>

        {/* Hero */}
        <div style={{
          height: 200, position: 'relative', overflow: 'hidden',
          background: COVER_GRADIENTS[gradientIdx % COVER_GRADIENTS.length],
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,8,6,.85), rgba(9,8,6,.2) 60%, transparent)' }} />
          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)',
            color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', minHeight: 'unset',
          }}>✕</button>
          {/* Bottom content */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 26px', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: COVER_GRADIENTS[gradientIdx % COVER_GRADIENTS.length],
              border: '3px solid rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-d)', fontSize: 26, fontWeight: 800, color: '#fff',
            }}>{name.charAt(0)}</div>
            <div>
              <div style={{ fontFamily: 'var(--f-d)', fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>{name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Tag variant="artist">Artist</Tag>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: '#fff' }}>{sub.split('·')[1]?.trim() || sub}</span>
                <Tag variant="venue">✔ Book-Ready</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 26px 40px' }}>
          {/* Actions row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <HypeBtn id={`profile-${name}`} hyped={hyped} onHype={() => setHyped(true)} count={hyped ? 'Hyped!' : 'Hype this Artist'} large />
            <button style={{ padding: '10px 18px', borderRadius: 99, border: '1px solid var(--line-2)', background: 'var(--surface)', color: 'var(--ink-2)', fontFamily: 'var(--f-b)', fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 'unset' }}>Share</button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
            {[{ v: '2,847', k: 'Total Hypes' }, { v: '14', k: 'Shows Played' }, { v: '6', k: 'Tracks' }, { v: '↑ #3', k: 'Local Rank', color: '#22e5d4' }].map(s => (
              <div key={s.k}>
                <div style={{ fontFamily: 'var(--f-d)', fontSize: 24, fontWeight: 700, color: (s as { color?: string }).color || 'var(--ink)', letterSpacing: '-.02em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.14em', marginTop: 4 }}>{s.k}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: activeTab === i ? 'var(--ink)' : 'var(--ink-3)',
                border: 'none', borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'none', marginBottom: -1, fontFamily: 'var(--f-b)',
                transition: 'all .15s', minHeight: 'unset',
              }}>{t}</button>
            ))}
          </div>

          {/* About tab */}
          {activeTab === 0 && (
            <div>
              <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>
                {name} is an independent artist creating music that resonates with real audiences. Their hype score is built entirely from community signals — no paid placement, no algorithm manipulation.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', display: 'inline-block' }} />
                Genres
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                <Tag variant="artist">{sub.split('·')[0]?.trim() || 'Independent'}</Tag>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-2)' }}>Soul</span>
              </div>
              <div style={{ background: 'rgba(255,80,41,.06)', border: '1px solid rgba(255,80,41,.15)', borderRadius: 14, padding: '14px 18px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--accent)', fontFamily: 'var(--f-m)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em' }}>Why recommended to you?</strong>
                <span style={{ display: 'block', marginTop: 6 }}>Fans who hyped similar tracks also hyped this artist. Location and community patterns — no personal data used.</span>
              </div>
            </div>
          )}

          {/* Music tab */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[{ t: 'Latest Release', a: '2024 · EP', d: '3:24' }, { t: 'City Lights', a: '2024 · EP', d: '4:02' }, { t: 'Hold On', a: '2024 · Single', d: '3:51' }, { t: 'Blue Hours', a: '2023 · Demo', d: '5:14' }].map((tr, i) => (
                <TrackRow key={tr.t} num={i + 1} title={tr.t} artist={tr.a} duration={tr.d} />
              ))}
              <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8 }}>All music on iHYPE is free to play. Artists host here on their own terms.</p>
            </div>
          )}

          {/* Shows tab */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ShowCard date="Sat, Jun 14 · 8:00 PM" title="Warehouse Sessions #14" meta={`The Foundry · ${sub.split('·')[1]?.trim() || 'Local'}`} badge="Free Entry" badgeType="free" hypeCount={1203} />
              <ShowCard date="Sat, Jun 28 · 7:00 PM" title="Underground Festival" meta="Prospect Park Stage" badge="$15" badgeType="ticketed" hypeCount={648} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stat chip ───────────────────────────────────────────────────
function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
      background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 99,
      fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-2)',
    }}>
      {icon}
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main ViewMyPage
// ─────────────────────────────────────────────────────────────────
export function ViewMyPage({ data, onPickTrack, currentIdx }: {
  data: WorkbenchData; onPickTrack: (i: number) => void; currentIdx: number;
}) {
  const [hypedIds, setHypedIds] = useState<Set<string>>(new Set());
  const [referral, setReferral] = useState<{ link: string; count: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [anniversaryDismissed, setAnniversaryDismissed] = useState(false);
  const [streakData, setStreakData] = useState<{ streak: number; daysActive: number } | null>(null);
  const [artistProfile, setArtistProfile] = useState<{ name: string; sub: string; gradientIdx: number } | null>(null);

  const handleHype = async (showId: string) => {
    if (hypedIds.has(showId)) return;
    setHypedIds(prev => new Set([...prev, showId]));
    try {
      await fetch('/api/hype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'show', targetId: showId }),
      });
    } catch {
      setHypedIds(prev => { const n = new Set(prev); n.delete(showId); return n; });
    }
  };

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.referralLink) setReferral({ link: d.referralLink, count: d.referralCount ?? 0 }); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/hype-streak')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStreakData({ streak: d.streak ?? 0, daysActive: d.daysActive ?? 0 }); })
      .catch(() => {});
  }, []);

  // Greeting time
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dayPart = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const city = data.city || 'your city';

  // Trending artists (stubbed with available data)
  const trendingArtists = [
    { name: 'Malia Torres', sub: 'R&B / Soul · Brooklyn, NY', hypeCount: 2847, gradientIdx: 0 },
    { name: 'Concrete Wave', sub: 'Electronic · Chicago, IL', hypeCount: 1203, gradientIdx: 1 },
    { name: 'Sun Valley Echo', sub: 'Indie Rock · Austin, TX', hypeCount: 891, gradientIdx: 2 },
  ];

  const heroStats = [
    { v: (data.lifeStats?.totalHype ?? 1284).toLocaleString(), k: 'HYPE Given', accent: true },
    { v: '842', k: 'Received', accent: false },
    { v: String(data.lifeStats?.eventsAttended ?? 23), k: 'Shows Attended', accent: false },
    { v: '7', k: 'Top-5 Slots', accent: false },
  ];

  return (
    <div style={{ padding: '0 0 48px', maxWidth: 1600, margin: '0 auto' }}>

      {/* ── DISCOVER SECTION ─────────────────────────────────────── */}
      <div style={{ padding: '32px 48px 0' }}>

        {/* Two-col discover layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          {/* Main feed */}
          <div>
            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })} {dayPart} · {city}
              </div>
              <div style={{ fontFamily: 'var(--f-d)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 8 }}>
                {timeGreet},{' '}
                <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#ff5029 0%,#ff3e9a 50%,#22e5d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {data.userName}
                </em>
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 20, lineHeight: 1.4 }}>
                Here&apos;s what&apos;s happening in your scene right now.
              </div>
            </div>

            {/* Community stat chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatChip icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ff5029" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M6 11a6 6 0 0012 0M12 17v4M9 21h6"/></svg>} label="12,847 artists" />
              <StatChip icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#b983ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a8 8 0 0116 0v3a3 3 0 01-3 3h-1v-6h2M4 14v3a3 3 0 003 3h1v-6H4"/></svg>} label="48K fans" />
              <StatChip icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ff5029" strokeWidth="1.7" strokeLinejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>} label="892K hypes" />
              <StatChip icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#22e5d4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>} label="340 shows this month" />
              <StatChip icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ff3e9a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>} label="47 cities" />
            </div>

            {/* Trending Artists */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--f-d)', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Trending Near You</h3>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}>
                See all →
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
              {trendingArtists.map((a, i) => (
                <EntityCard
                  key={a.name}
                  name={a.name}
                  sub={a.sub}
                  type="Artist"
                  hypeCount={a.hypeCount}
                  gradientIdx={a.gradientIdx}
                  onHype={() => {}}
                  onProfile={() => setArtistProfile({ name: a.name, sub: a.sub, gradientIdx: a.gradientIdx })}
                />
              ))}
            </div>

            {/* Fresh Drops */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--f-d)', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Fresh Drops</h3>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}>
                Browse all →
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32 }}>
              {data.tracks.slice(0, 4).map((t, i) => (
                <TrackRow key={t.id} num={i + 1} title={t.title} artist={t.artistName} duration={t.duration} />
              ))}
              {data.tracks.length === 0 && (
                <>
                  <TrackRow num={1} title="Crimson Light" artist="Malia Torres" duration="3:24" />
                  <TrackRow num={2} title="Depth Finder" artist="Concrete Wave" duration="4:11" />
                  <TrackRow num={3} title="Untitled Heart" artist="The Lune Collective" duration="2:58" />
                  <TrackRow num={4} title="Frequency" artist="Sun Valley Echo" duration="3:47" />
                </>
              )}
            </div>

            {/* Shows Near You */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--f-d)', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Shows Near You</h3>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}>
                All shows →
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.shows.slice(0, 3).map(s => (
                <ShowCard
                  key={s.id}
                  date={new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` · ${s.time}`}
                  title={s.name}
                  meta={s.venue}
                  badge={s.price === 0 ? 'Free Entry' : `$${s.price}`}
                  badgeType={s.price === 0 ? 'free' : 'ticketed'}
                  hypeCount={s.hype}
                  onHype={() => handleHype(s.id)}
                />
              ))}
              {data.shows.length === 0 && (
                <>
                  <ShowCard date="Sat, Jun 14 · 8:00 PM" title="Warehouse Sessions #12" meta="Malia Torres + Concrete Wave · The Foundry, Brooklyn" badge="Free Entry" badgeType="free" hypeCount={1203} />
                  <ShowCard date="Fri, Jun 20 · 9:30 PM" title="Concrete Wave Live" meta="Electronic Night · Metro Chicago" badge="$10 at door" badgeType="ticketed" hypeCount={648} />
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 16 }}>
            {/* Hype activity */}
            <SidebarCard title="Hype activity near you">
              <HypeBarRow label="Brooklyn, NY" pct={85} count="4.2k" />
              <HypeBarRow label="Chicago, IL" pct={62} count="3.1k" />
              <HypeBarRow label="Austin, TX" pct={41} count="2.0k" />
              <HypeBarRow label="Los Angeles" pct={30} count="1.5k" />
              <HypeBarRow label="Atlanta, GA" pct={18} count="900" />
            </SidebarCard>

            {/* Top genres */}
            <SidebarCard title="Top genres this week">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Tag variant="artist">R&amp;B / Soul</Tag>
                <Tag variant="venue">Electronic</Tag>
                <Tag>Indie Rock</Tag>
                <Tag variant="fan">Hip-Hop</Tag>
                <Tag>Jazz</Tag>
                <Tag variant="promoter">Afrobeats</Tag>
              </div>
            </SidebarCard>

            {/* Privacy card */}
            <div style={{
              background: 'rgba(34,229,212,.05)', border: '1px solid rgba(34,229,212,.15)',
              borderRadius: 18, padding: '16px 18px', marginBottom: 12,
              cursor: 'pointer', transition: 'border-color .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,229,212,.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(34,229,212,.15)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <span style={{ fontFamily: 'var(--f-d)', fontSize: 14, fontWeight: 700, color: '#22e5d4' }}>Your Privacy</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>iHYPE stores only aggregated signals. Even if we got hacked, there&apos;d be nothing personal to find.</div>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: '#22e5d4', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>See exactly what we hold →</div>
            </div>

            {/* Create show card */}
            <div style={{
              background: 'rgba(255,62,154,.05)', border: '1px solid rgba(255,62,154,.18)',
              borderRadius: 18, padding: '16px 18px',
              cursor: 'pointer', transition: 'border-color .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,62,154,.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,62,154,.18)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>🎉</span>
                <span style={{ fontFamily: 'var(--f-d)', fontSize: 14, fontWeight: 700, color: '#ff3e9a' }}>Create a Show</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>Promoters &amp; DJs: set up your next event in 3 quick steps.</div>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: '#ff3e9a', marginTop: 8 }}>Open Show Creator →</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION DIVIDER ─────────────────────────────────────── */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--line-2) 30%, var(--line-2) 70%, transparent)', margin: '40px 48px' }} />

      {/* ── PERSONAL PROFILE SECTION ────────────────────────────── */}
      <div style={{ padding: '0 48px' }}>
        {/* Hero — 3-col grid */}
        <div className="me-hero-grid" style={{
          display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: 28, alignItems: 'center',
          padding: 26, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))',
          border: '1px solid var(--line-2)', position: 'relative', overflow: 'hidden', marginBottom: 28,
        }}>
          <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '50%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,80,41,.18), transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
          {/* Portrait */}
          <div style={{
            width: 200, height: 200, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent) 0%, #ff3e9a 50%, #b983ff 100%)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
          }}>
            <span style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 90, color: '#0a0805', letterSpacing: '-.04em', mixBlendMode: 'overlay', opacity: .85, lineHeight: 1 }}>{data.userInitials}</span>
          </div>

          {/* Identity col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              {data.activeProfileTypes.slice(0, 2).map(r => {
                const roleColors: Record<string, string> = { LISTENER: '#b983ff', ARTIST: '#ff5029', VENUE: '#22e5d4', DJ: '#ff3e9a' };
                const c = roleColors[r] ?? '#9e9080';
                return (
                  <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 99, background: 'var(--bg-3)', border: '1px solid var(--line-2)', fontFamily: 'var(--f-m)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: 'var(--ink)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }} />{r}
                  </span>
                );
              })}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 99, background: 'rgba(255,184,74,.12)', border: '1px solid rgba(255,184,74,.28)', fontFamily: 'var(--f-m)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#ffb84a' }}>⚡ LEVEL 14</span>
            </div>
            <h1 style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 46, letterSpacing: '-.03em', lineHeight: .95, margin: 0, color: 'var(--ink)' }}>{data.userName}</h1>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-2)', letterSpacing: '.08em' }}>@{data.userName.toLowerCase().replace(/\s/g, '.')} · {data.city} · Joined Mar &apos;25</div>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.4, maxWidth: '50ch' }}>Halflight EP out now. Writing the next thing in a basement on Western Ave. Recommendations open.</p>
          </div>

          {/* Stats 2×2 grid */}
          <div className="me-hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '18px 28px', zIndex: 1 }}>
            {heroStats.map(s => (
              <div key={s.k} style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 30, letterSpacing: '-.02em', lineHeight: 1, color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 6 }}>{s.k}</div>
              </div>
            ))}
          </div>
          {/* Inline stats for narrow screens */}
          <div className="me-hero-stats-inline" style={{ display: 'none', gap: 20, flexWrap: 'wrap', gridColumn: '1 / -1', zIndex: 1, paddingTop: 8 }}>
            {heroStats.map(s => (
              <div key={s.k} style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', lineHeight: 1, color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 4 }}>{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 14, marginBottom: 20, alignItems: 'stretch' }}>
          {[
            { k: 'Weekly Listens', v: '2,284', d: <><span style={{ color: '#22e5d4' }}>↑ 18%</span> vs last week</> },
            { k: 'Seed Save Rate', v: '26%', d: '88 saves on Sundown' },
            { k: 'Next Payout', v: '$2,460', d: 'releases Jun 24' },
            { k: 'Next Show', v: 'Jun 18', d: 'Empty Bottle · 9PM' },
          ].map(s => (
            <div key={s.k} style={{ padding: '16px 18px', border: '1px solid var(--line-2)', borderRadius: 12, background: 'var(--bg-2)', boxShadow: '0 2px 16px rgba(0,0,0,.22)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.025) 0%, transparent 50%)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{s.k}</div>
              <div style={{ fontFamily: 'var(--f-d)', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)', lineHeight: 1, marginTop: 6 }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>{s.d}</div>
            </div>
          ))}
          {/* Hype Streak card */}
          {streakData !== null && (() => {
            const s = streakData.streak;
            const emoji = s >= 30 ? '⚡' : '🔥';
            const glowBox = s >= 30 ? '0 0 0 2px #b983ff' : s >= 7 ? '0 0 0 2px #f5d060' : undefined;
            return (
              <div style={{
                padding: '14px 18px', border: '1px solid rgba(255,80,41,.25)', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(255,80,41,.15), rgba(255,184,74,.08))',
                boxShadow: glowBox, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minWidth: 110, textAlign: 'center',
              }}>
                {s === 0 ? (
                  <>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>🔥</div>
                    <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', marginTop: 8, maxWidth: 120, lineHeight: 1.4 }}>Start your streak — hype something today</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 32, lineHeight: 1 }}>{emoji}</div>
                    <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 32, letterSpacing: '-.02em', lineHeight: 1, color: 'var(--ink)', marginTop: 4 }}>{s}</div>
                    <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>day streak</div>
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* Referral link */}
        {referral && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: '1px solid var(--line-2)', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,.2)', background: 'var(--bg-2)', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.18em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                Your referral link · {referral.count} signup{referral.count !== 1 ? 's' : ''}
              </div>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{referral.link}</div>
            </div>
            <button onClick={async () => { await navigator.clipboard.writeText(referral.link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ padding: '8px 14px', borderRadius: 7, border: copied ? '1px solid rgba(34,229,212,.4)' : '1px solid var(--line-2)', fontFamily: 'var(--f-m)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', cursor: 'pointer', background: copied ? 'rgba(34,229,212,.08)' : 'var(--bg-3)', color: copied ? '#22e5d4' : 'var(--ink-2)', transition: 'all .2s', flexShrink: 0 }}>
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)', flexShrink: 0, textAlign: 'right', maxWidth: 100, lineHeight: 1.4 }}>Earn 10% of each ticket sale</div>
          </div>
        )}

        {/* Anniversary Card */}
        {!anniversaryDismissed && data.lifeStats && data.lifeStats.totalHype > 0 && (
          <div style={{ position: 'relative', padding: '16px 20px', marginBottom: 14, borderRadius: 14, border: '1px solid rgba(255,80,41,.2)', background: 'linear-gradient(135deg, rgba(255,80,41,.12), rgba(185,131,255,.08))' }}>
            <button onClick={() => setAnniversaryDismissed(true)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 16, lineHeight: 1, padding: 4 }} aria-label="Dismiss">✕</button>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-.01em' }}>🎂 1 year on iHYPE</div>
            <div style={{ fontFamily: 'var(--f-b)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {data.lifeStats.totalHype.toLocaleString()} hypes, {data.lifeStats.eventsAttended} events attended, {data.lifeStats.songsPlayed.toLocaleString()} songs played. Thanks for being part of the scene.
            </div>
          </div>
        )}

        {/* Two-col: Top 5 + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 14 }}>
          <Panel title="Top 5 — this week" link="Curated · updates Sundays">
            <div style={{ padding: '4px 0' }}>
              {data.tracks.slice(0, 5).map((t, i) => (
                <button key={t.id} onClick={() => onPickTrack(i)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  borderBottom: '1px solid var(--line)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderLeft: i === currentIdx ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                  <span style={{ width: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i === currentIdx ? (
                      <div style={{ width: 20, display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
                        {[0,1,2].map(b => (
                          <span key={b} style={{ flex: 1, background: 'var(--accent)', borderRadius: 1, animation: `eq ${0.6 + b * 0.15}s ease-in-out infinite alternate`, height: '100%' }} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 13, color: 'var(--ink-3)', width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                    )}
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 5, background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, color: i === currentIdx ? 'var(--accent)' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', marginTop: 2, letterSpacing: '.04em' }}>{t.artistName} · {t.album}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleHype(t.id); }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--f-m)', fontSize: 13, color: hypedIds.has(t.id) ? '#ff3e9a' : 'var(--ink-3)', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <IcHeart s={10} c={hypedIds.has(t.id) ? '#ff3e9a' : 'var(--ink-3)'} /> {t.hypeCount + (hypedIds.has(t.id) ? 1 : 0)}
                  </button>
                  <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', flexShrink: 0, minWidth: 32, textAlign: 'right' }}>{t.duration}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Recent activity" link="Mark read">
            <div style={{ padding: '4px 0' }}>
              {data.activity.slice(0, 5).map((a, i) => {
                const dotColor: Record<string, string> = { hype: '#ff3e9a', show: '#22e5d4', radio: '#b983ff', payout: '#ffb84a' };
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--line)', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor[a.kind] || 'var(--ink-3)', flexShrink: 0, boxShadow: `0 0 6px ${dotColor[a.kind] || 'var(--ink-3)'}` }} />
                    <div style={{ flex: 1, fontFamily: 'var(--f-b)', fontSize: 13, color: 'var(--ink)' }}>{a.text}</div>
                    <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', flexShrink: 0 }}>{a.time}</div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* HYPEd tracks */}
        <Panel title="HYPEd this week" link="Open seeds →" style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, padding: '14px 16px' }}>
            {data.tracks.slice(0, 6).map((t, i) => (
              <TrackCard key={t.id} track={t} active={i === currentIdx} onClick={() => onPickTrack(i)} />
            ))}
          </div>
        </Panel>

        {/* Ticket Stubs */}
        <Panel title="🎟️ Your Ticket Stubs" style={{ marginBottom: 14 }}>
          {data.tickets.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--f-m)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎟️</div>
              Your stubs will appear here after your first show
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, padding: '14px 16px' }}>
              {data.tickets.map((tk, i) => (
                <TicketStub key={tk.id} ticket={tk} accentColor={STUB_ACCENT_PALETTE[i % STUB_ACCENT_PALETTE.length]} />
              ))}
            </div>
          )}
        </Panel>

        {/* Your roles */}
        <Panel title="Your roles">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '14px 16px' }}>
            {(['LISTENER','ARTIST','VENUE','DJ'] as const).map(rk => {
              const active = data.activeProfileTypes.includes(rk);
              const roleColors: Record<string, string> = { LISTENER: '#b983ff', ARTIST: '#ff5029', VENUE: '#22e5d4', DJ: '#ff3e9a' };
              const roleLabels: Record<string, { label: string; sub: string }> = {
                LISTENER: { label: 'Fan', sub: 'HYPE tracks, swipe seeds, attend' },
                ARTIST:   { label: 'Artist', sub: 'Upload, seed, tour · 45% of every ticket' },
                VENUE:    { label: 'Venue', sub: 'List shows · 45% · demand radar' },
                DJ:       { label: 'Promoter/DJ', sub: 'Referral links · 10% on tickets you drive' },
              };
              const col = roleColors[rk];
              const info = roleLabels[rk];
              return (
                <div key={rk} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: `1px solid ${active ? col : 'var(--line)'}`, borderRadius: 8, background: active ? `${col}08` : 'var(--bg-2)', boxShadow: active ? `0 2px 14px ${col}20` : 'none' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: col, flexShrink: 0, boxShadow: `0 0 8px ${col}` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{info.label}</div>
                    <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.04em', marginTop: 2 }}>{info.sub}</div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: `1px solid ${active ? col + '40' : 'var(--line-2)'}`, borderRadius: 99, fontFamily: 'var(--f-m)', fontSize: 12, letterSpacing: '.04em', color: active ? col : 'var(--ink-2)', background: 'none', cursor: 'pointer' }}>
                    {active ? <><IcCheck s={11} /> active</> : 'add →'}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Artist Profile Drawer */}
      {artistProfile && (
        <ArtistProfileDrawer
          name={artistProfile.name}
          sub={artistProfile.sub}
          gradientIdx={artistProfile.gradientIdx}
          onClose={() => setArtistProfile(null)}
        />
      )}
    </div>
  );
}
