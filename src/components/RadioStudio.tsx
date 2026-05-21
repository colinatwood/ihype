'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ── Design tokens (mirrors Android App/shared.jsx) ────────────────────────────
const T = {
  bg: '#0a0805',
  bg2: '#100d09',
  bg3: '#1a1612',
  bg4: '#221c16',
  ink: '#f0ebe5',
  ink2: '#9e9080',
  ink3: '#5a5048',
  ink4: '#3a342e',
  accent: '#ff5029',
  promoter: '#ff3e9a',
  venue: '#22e5d4',
  fan: '#b983ff',
  warn: '#ffb84a',
  blue: '#7fb3ff',
};

// ── SVG icon kit ──────────────────────────────────────────────────────────────
const Ic = {
  mic: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  wave: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  drag: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
    </svg>
  ),
  more: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
    </svg>
  ),
  plus: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  trash: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  archive: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M10 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  stop: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  rocket: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 4l6 6-9 9-3-3 9-9-3-3zM4 20l4-4M10 14l-3 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  play: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4l14 8L6 20z" />
    </svg>
  ),
  share: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 11l6-4M9 14l6 3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  check: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowLeft: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M10 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  heart: (s = 12) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7-4.5-9.5-9.2C.8 8.2 3 4.5 6.5 4.5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4.5 23.2 8.2 21.5 11.8 19 16.5 12 21 12 21z" />
    </svg>
  ),
};

// ── Types ─────────────────────────────────────────────────────────────────────
type ShowStatus = 'LIVE' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';
type BlockKind = 'track' | 'voice' | 'sample' | 'slot';

interface Show {
  id: string;
  title: string;
  episode: string;
  color: string;
  status: ShowStatus;
  plays: string;
  duration: string;
  when: string;
}

interface Block {
  id: string;
  kind: BlockKind;
  label: string;
  duration: string;
  color: string;
  position: number;
}

interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  color: string;
  duration: string;
  hypes: number;
}

type Screen = 'studio' | 'builder' | 'record' | 'published';

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_SHOWS: Show[] = [
  { id: '1', title: 'Halflight FM', episode: 'EP 04 · The Slow Burn',   color: T.accent,   status: 'LIVE',      plays: '2.3k', duration: '42 min', when: 'Aired 2d ago' },
  { id: '2', title: 'Halflight FM', episode: 'EP 05 · Tonight is fine', color: T.promoter, status: 'DRAFT',     plays: '—',    duration: '31 min', when: 'Auto-saving' },
  { id: '3', title: 'Cobalt Hour',  episode: 'Guest mix · Vela',        color: T.venue,    status: 'SCHEDULED', plays: '—',    duration: '58 min', when: 'Sun Jun 22 · 10AM' },
  { id: '4', title: 'Halflight FM', episode: 'EP 03 · River songs',     color: T.fan,      status: 'ARCHIVED',  plays: '4.1k', duration: '45 min', when: 'Apr 12' },
];

const INITIAL_BLOCKS: Block[] = [
  { id: 'b1', kind: 'voice',  label: 'Intro · welcome to Halflight', duration: '0:34', color: T.promoter, position: 0 },
  { id: 'b2', kind: 'track',  label: 'Sundown — Maya Reyes',         duration: '3:42', color: T.accent,   position: 1 },
  { id: 'b3', kind: 'sample', label: 'Crowd · Empty Bottle',         duration: '0:05', color: T.warn,     position: 2 },
  { id: 'b4', kind: 'track',  label: 'Cobalt Hour — Vela',           duration: '4:18', color: T.venue,    position: 3 },
];

const LIBRARY_TRACKS: LibraryTrack[] = [
  { id: 't1', title: 'Halflight',        artist: 'Maya Reyes',    color: T.accent,   duration: '4:02', hypes: 412 },
  { id: 't2', title: 'Riverside Memory', artist: 'Colin Atwood',  color: T.fan,      duration: '3:18', hypes: 284 },
  { id: 't3', title: 'Glasshouse',       artist: 'June Mire',     color: T.warn,     duration: '2:51', hypes: 192 },
  { id: 't4', title: 'Slow Drift',       artist: 'The Hightones', color: T.venue,    duration: '5:04', hypes: 158 },
];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function statusColor(s: ShowStatus) {
  if (s === 'LIVE') return T.venue;
  if (s === 'DRAFT') return T.warn;
  if (s === 'SCHEDULED') return T.blue;
  return T.ink3;
}

function AlbumArt({ color, size = 48, label }: { color: string; size?: number; label?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}66 60%, ${color}30)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.22), transparent 60%)' }} />
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 5, fontFamily: 'var(--font-syne, sans-serif)', fontWeight: 800, fontSize: size > 60 ? 11 : 9, lineHeight: 1, color: 'rgba(255,255,255,.85)' }}>
          {label.slice(0, 6)}
        </div>
      )}
    </div>
  );
}

// ── Screen 1: Studio — list of shows ─────────────────────────────────────────
function StudioScreen({ onOpenBuilder, onOpenPublished }: { onOpenBuilder: () => void; onOpenPublished: () => void }) {
  const [filter, setFilter] = useState<'All' | 'Live' | 'Drafts' | 'Archived'>('All');
  const [actionSheet, setActionSheet] = useState<string | null>(null);
  const [shows, setShows] = useState<Show[]>(SAMPLE_SHOWS);

  const filtered = shows.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Live') return s.status === 'LIVE';
    if (filter === 'Drafts') return s.status === 'DRAFT';
    if (filter === 'Archived') return s.status === 'ARCHIVED';
    return true;
  });

  function archiveShow(id: string) {
    setShows(prev => prev.map(s => s.id === id ? { ...s, status: 'ARCHIVED' as ShowStatus } : s));
    setActionSheet(null);
  }
  function deleteShow(id: string) {
    setShows(prev => prev.filter(s => s.id !== id));
    setActionSheet(null);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, color: T.ink, fontFamily: 'var(--font-dm, Roboto, sans-serif)', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: T.promoter, display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.promoter, letterSpacing: '.16em', fontWeight: 700 }}>RADIO STUDIO</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-dm, sans-serif)', fontWeight: 400, fontSize: 36, margin: 0, lineHeight: 1.1, color: T.ink }}>Your shows</h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 16px', flexShrink: 0, overflowX: 'auto' }}>
        {(['All', 'Live', 'Drafts', 'Archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 99, border: `1px solid ${filter === f ? T.promoter + '50' : 'rgba(255,255,255,.08)'}`,
              background: filter === f ? `${T.promoter}20` : T.bg2,
              color: filter === f ? T.promoter : T.ink2,
              fontFamily: 'var(--font-dm, sans-serif)', fontSize: 13, fontWeight: filter === f ? 600 : 500,
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Shows list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ opacity: s.status === 'ARCHIVED' ? 0.55 : 1 }}>
              <div
                style={{
                  background: T.bg2, borderRadius: 20, padding: '14px', display: 'flex', alignItems: 'center', gap: 14,
                  border: `1px solid ${actionSheet === s.id ? T.promoter + '30' : 'transparent'}`,
                }}
              >
                <AlbumArt color={s.color} size={64} label={s.episode.split('·')[0].trim()} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: statusColor(s.status), display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: statusColor(s.status), letterSpacing: '.16em', fontWeight: 700 }}>{s.status}</span>
                  </div>
                  <div
                    style={{ fontWeight: 500, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    onClick={() => s.status !== 'ARCHIVED' && onOpenBuilder()}
                  >
                    {s.episode}
                  </div>
                  <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, marginTop: 4 }}>
                    {s.title} · {s.duration} · {s.plays !== '—' ? `${s.plays} plays` : s.when}
                  </div>
                </div>
                <button
                  onClick={() => setActionSheet(actionSheet === s.id ? null : s.id)}
                  aria-label="Show actions"
                  style={{ width: 40, height: 40, borderRadius: 99, background: 'transparent', border: 'none', color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  {Ic.more(20)}
                </button>
              </div>

              {/* Inline action sheet */}
              {actionSheet === s.id && (
                <div style={{ margin: '8px 4px 0', background: T.bg3, borderRadius: 20, padding: '12px 16px', border: `1px solid rgba(255,255,255,.1)` }}>
                  <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: T.ink3, letterSpacing: '.16em', fontWeight: 600, marginBottom: 8 }}>
                    {s.episode.toUpperCase()} · ACTIONS
                  </div>
                  {[
                    { icon: Ic.rocket(16), label: 'Promote on my page', sub: 'Pin to top · push to followers', color: T.promoter, action: () => { onOpenPublished(); setActionSheet(null); } },
                    { icon: Ic.archive(16), label: 'Archive', sub: 'Hides from public · keeps stats', color: T.ink2, action: () => archiveShow(s.id) },
                    { icon: Ic.trash(16), label: 'Delete', sub: 'Permanent · payouts settle first', color: '#ff6b5a', action: () => deleteShow(s.id) },
                  ].map((a, k) => (
                    <button
                      key={k}
                      onClick={a.action}
                      style={{
                        width: '100%', padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12,
                        borderTop: k === 0 ? 'none' : `1px solid rgba(255,255,255,.06)`,
                        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                        borderTopWidth: k === 0 ? 0 : 1, borderTopStyle: 'solid', borderTopColor: 'rgba(255,255,255,.06)',
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 99, background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                        {a.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: a.color === '#ff6b5a' ? '#ff6b5a' : T.ink }}>{a.label}</div>
                        <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>{a.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: T.ink3 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📻</div>
              <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 11, letterSpacing: '.1em' }}>NO SHOWS YET</div>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: 'absolute', right: 18, bottom: 24 }}>
        <button
          onClick={onOpenBuilder}
          style={{
            height: 56, padding: '0 22px', borderRadius: 18, background: T.promoter, color: T.bg, border: 'none',
            fontFamily: 'var(--font-dm, sans-serif)', fontWeight: 600, fontSize: 15, display: 'inline-flex',
            alignItems: 'center', gap: 8, boxShadow: `0 6px 24px ${T.promoter}55`, cursor: 'pointer',
          }}
        >
          <span style={{ color: T.bg, display: 'flex' }}>{Ic.plus(18)}</span>
          New show
        </button>
      </div>
    </div>
  );
}

// ── Screen 2: Builder — drag-and-drop show line ───────────────────────────────
function BuilderScreen({ onBack, onRecord, onPublish }: { onBack: () => void; onRecord: () => void; onPublish: () => void }) {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [libraryDragId, setLibraryDragId] = useState<string | null>(null);
  const [dropSlotActive, setDropSlotActive] = useState(false);

  const totalSecs = blocks.reduce((acc, b) => {
    const [m, s] = b.duration.split(':').map(Number);
    return acc + (m || 0) * 60 + (s || 0);
  }, 0);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  // ── Block-level drag-and-drop (reorder) ─────────────────────────────────
  function onBlockDragStart(id: string) { setDragId(id); }
  function onBlockDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id); }
  function onBlockDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setBlocks(prev => {
      const ordered = [...prev].sort((a, b) => a.position - b.position);
      const from = ordered.findIndex(b => b.id === dragId);
      const to   = ordered.findIndex(b => b.id === targetId);
      const moved = ordered.splice(from, 1)[0];
      ordered.splice(to, 0, moved);
      return ordered.map((b, i) => ({ ...b, position: i }));
    });
    setDragId(null); setDragOverId(null);
  }

  // ── Library track drag to drop slot ─────────────────────────────────────
  function onLibraryDragStart(id: string) { setLibraryDragId(id); setDropSlotActive(true); }
  function onDropSlot(e: React.DragEvent) {
    e.preventDefault();
    if (!libraryDragId) return;
    const track = LIBRARY_TRACKS.find(t => t.id === libraryDragId);
    if (track) {
      const newBlock: Block = {
        id: `b${Date.now()}`,
        kind: 'track',
        label: `${track.title} — ${track.artist}`,
        duration: track.duration,
        color: track.color,
        position: blocks.length,
      };
      setBlocks(prev => [...prev, newBlock]);
    }
    setLibraryDragId(null);
    setDropSlotActive(false);
  }

  function removeBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id).map((b, i) => ({ ...b, position: i })));
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, color: T.ink, overflow: 'hidden', fontFamily: 'var(--font-dm, sans-serif)' }}>
      {/* Compact title bar */}
      <div style={{ padding: '4px 8px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={onBack} aria-label="Back" style={{ width: 48, height: 48, borderRadius: 99, background: 'transparent', color: T.ink, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {Ic.arrowLeft(20)}
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: T.warn, letterSpacing: '.16em', fontWeight: 700 }}>● DRAFT · AUTO-SAVED</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>EP 05 · Tonight is fine</div>
        </div>
        <button
          onClick={onPublish}
          style={{ height: 36, padding: '0 14px', borderRadius: 99, background: T.promoter, color: T.bg, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Preview
        </button>
      </div>

      {/* Duration strip */}
      <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-syne, sans-serif)', fontWeight: 800, fontSize: 32, letterSpacing: '-.02em', lineHeight: 1 }}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>
        <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.1em', fontWeight: 600 }}>
          {blocks.length} BLOCKS · ROOM FOR {26 - blocks.length} MORE
        </div>
      </div>

      {/* Show line */}
      <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.16em', fontWeight: 600, padding: '0 6px 8px' }}>
          SHOW LINE · DRAG TO REORDER
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
          {sortedBlocks.map(b => (
            <div
              key={b.id}
              draggable
              onDragStart={() => onBlockDragStart(b.id)}
              onDragOver={e => onBlockDragOver(e, b.id)}
              onDrop={e => onBlockDrop(e, b.id)}
              style={{
                height: 60, borderRadius: 16, background: dragOverId === b.id ? T.bg4 : T.bg2,
                display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px 0 8px',
                border: `1px solid ${dragOverId === b.id ? T.promoter + '40' : 'rgba(255,255,255,.06)'}`,
                opacity: dragId === b.id ? 0.4 : 1, cursor: 'grab', userSelect: 'none',
                transition: 'background .15s, border-color .15s',
              }}
            >
              <div style={{ color: T.ink3, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{Ic.drag(14)}</div>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: b.kind === 'track' ? `linear-gradient(135deg, ${b.color}, ${b.color}55)` : `${b.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.color,
              }}>
                {b.kind === 'voice' ? Ic.mic(14) : b.kind === 'sample' ? Ic.wave(14) : Ic.play(11)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: b.color, letterSpacing: '.14em', fontWeight: 700 }}>{b.kind.toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: T.ink4 }}>· {String(b.position + 1).padStart(2, '0')}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 11, color: T.ink2, flexShrink: 0 }}>{b.duration}</div>
              <button
                onClick={() => removeBlock(b.id)}
                aria-label="Remove block"
                style={{ width: 28, height: 28, borderRadius: 99, background: 'transparent', border: 'none', color: T.ink4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                {Ic.trash(12)}
              </button>
            </div>
          ))}

          {/* Drop slot */}
          <div
            onDragOver={e => { e.preventDefault(); }}
            onDrop={onDropSlot}
            style={{
              height: 60, borderRadius: 16, border: `2px dashed ${dropSlotActive ? T.promoter : T.ink4}`,
              background: dropSlotActive ? `${T.promoter}10` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-jb, monospace)', fontSize: 11, color: dropSlotActive ? T.promoter : T.ink4,
              letterSpacing: '.14em', fontWeight: 600, transition: 'all .2s',
            }}
          >
            <span style={{ display: 'flex' }}>{Ic.plus(14)}</span>
            {dropSlotActive ? 'RELEASE TO DROP' : 'DRAG TRACK HERE'}
          </div>
        </div>
      </div>

      {/* Library drawer */}
      <div style={{ flex: 1, background: T.bg2, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '14px 16px 0', display: 'flex', flexDirection: 'column', minHeight: 0, borderTop: `1px solid rgba(255,255,255,.06)`, overflow: 'hidden' }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: T.ink4, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.16em', fontWeight: 600 }}>LIBRARY · DRAG TO SHOW LINE</div>
            <div style={{ fontWeight: 500, fontSize: 16, marginTop: 3 }}>Your hyped tracks</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onRecord}
              aria-label="Record voice over"
              style={{ width: 40, height: 40, borderRadius: 99, background: `${T.promoter}20`, border: 'none', color: T.promoter, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {Ic.mic(18)}
            </button>
            <button
              onClick={onRecord}
              aria-label="Record sample"
              style={{ width: 40, height: 40, borderRadius: 99, background: `${T.warn}20`, border: 'none', color: T.warn, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {Ic.wave(18)}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 24 }}>
          {LIBRARY_TRACKS.map(track => {
            const isDragging = libraryDragId === track.id;
            return (
              <div
                key={track.id}
                draggable
                onDragStart={() => onLibraryDragStart(track.id)}
                onDragEnd={() => { setLibraryDragId(null); setDropSlotActive(false); }}
                style={{
                  padding: '8px 12px 8px 8px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
                  background: isDragging ? `${track.color}06` : 'transparent',
                  border: `1px solid ${isDragging ? track.color + '50' : 'transparent'}`,
                  opacity: isDragging ? 0.35 : 1,
                  cursor: 'grab', userSelect: 'none',
                }}
              >
                <div style={{ color: T.ink3, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{Ic.drag(14)}</div>
                <AlbumArt color={track.color} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                  <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{track.artist} · {track.duration}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink2, flexShrink: 0 }}>
                  <span style={{ color: T.promoter, display: 'flex' }}>{Ic.heart(10)}</span>
                  {track.hypes}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Screen 3: Record sheet (voice over / 5-sec sample) ───────────────────────
function RecordScreen({ onBack, onDone }: { onBack: () => void; onDone: (blob: Blob | null, kind: 'voice' | 'sample') => void }) {
  const [kind, setKind] = useState<'voice' | 'sample'>('voice');
  const [phase, setPhase] = useState<'idle' | 'recording' | 'done'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [waveData, setWaveData] = useState<number[]>(Array.from({ length: 48 }, () => Math.random() * 20 + 6));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const MAX_SECS = kind === 'sample' ? 5 : 300;

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        setPhase('done');
      };
      mr.start();
      mediaRef.current = mr;
    } catch {
      // Mic not available in browser env — still animate
    }

    setPhase('recording');
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        setWaveData(Array.from({ length: 48 }, (_, i) => {
          const recorded = i < Math.floor((next / MAX_SECS) * 48);
          return recorded ? 14 + Math.abs(Math.sin(i * 1.7) * 36) + Math.abs(Math.cos(i * 0.9) * 18) : 6 + Math.abs(Math.sin(i * 0.6) * 12);
        }));
        if (next >= MAX_SECS) {
          stopRecording();
          return MAX_SECS;
        }
        return next;
      });
    }, 1000);
  }

  function stopRecording() {
    stopTimer();
    if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop();
    else setPhase('done');
  }

  function retry() { setPhase('idle'); setElapsed(0); blobRef.current = null; }

  useEffect(() => () => { stopTimer(); mediaRef.current?.stop(); }, []);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, color: T.ink, fontFamily: 'var(--font-dm, sans-serif)', overflow: 'hidden', position: 'relative' }}>
      {/* Dimmed builder backdrop */}
      <div style={{ flex: 1, opacity: 0.18, padding: '14px 16px', overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.16em', marginBottom: 8 }}>SHOW LINE</div>
        {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 46, background: T.bg2, borderRadius: 14, marginBottom: 6 }} />)}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }} />

      {/* Bottom sheet */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.bg2, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '12px 24px 40px', boxShadow: '0 -20px 60px rgba(0,0,0,.7)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: T.ink4, margin: '0 auto 16px' }} />

        {/* Type selector */}
        <div style={{ display: 'flex', background: T.bg3, borderRadius: 99, padding: 4, marginBottom: 22 }}>
          {(['voice', 'sample'] as const).map(k => (
            <button
              key={k}
              onClick={() => { if (phase === 'idle') setKind(k); }}
              style={{
                flex: 1, height: 40, borderRadius: 99, border: 'none', cursor: phase === 'idle' ? 'pointer' : 'default',
                background: kind === k ? T.promoter : 'transparent',
                color: kind === k ? T.bg : T.ink2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: kind === k ? 600 : 500,
                transition: 'background .2s, color .2s',
              }}
            >
              <span style={{ display: 'flex' }}>{k === 'voice' ? Ic.mic(15) : Ic.wave(15)}</span>
              {k === 'voice' ? 'Voice over' : 'Sample · 5s'}
            </button>
          ))}
        </div>

        {/* Status / timer */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {phase === 'recording' && (
            <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.promoter, letterSpacing: '.16em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: T.promoter, display: 'inline-block' }} />
              RECORDING
            </div>
          )}
          {phase === 'done' && (
            <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.venue, letterSpacing: '.16em', fontWeight: 700, marginBottom: 8 }}>DONE · REVIEW</div>
          )}
          {phase === 'idle' && (
            <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.12em', marginBottom: 8 }}>READY TO RECORD</div>
          )}
          <div style={{ fontFamily: 'var(--font-syne, sans-serif)', fontWeight: 800, fontSize: 48, letterSpacing: '-.02em', lineHeight: 1 }}>
            {fmtTime(elapsed)}
            {kind === 'sample' && <span style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 14, color: T.warn, marginLeft: 8 }}>/ 0:05</span>}
          </div>
          {phase !== 'idle' && (
            <div style={{ fontFamily: 'var(--font-dm, sans-serif)', fontSize: 12, color: T.ink3, marginTop: 6 }}>Will drop in after last block</div>
          )}
        </div>

        {/* Waveform */}
        <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 20 }}>
          {waveData.map((h, i) => {
            const recorded = i < Math.floor((elapsed / Math.max(elapsed, 1)) * Math.min(elapsed / MAX_SECS, 1) * 48);
            return (
              <div key={i} style={{ width: 4, height: Math.max(4, Math.min(h, 70)), borderRadius: 99, background: (phase === 'recording' && i < Math.floor((elapsed / MAX_SECS) * 48)) ? T.promoter : T.ink4, opacity: phase === 'idle' ? 0.4 : 1, transition: 'height .1s' }} />
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          {(phase === 'recording' || phase === 'done') && (
            <button
              onClick={retry}
              style={{ width: 56, height: 56, borderRadius: 99, background: T.bg3, border: 'none', color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jb, monospace)', fontSize: 10, fontWeight: 600, letterSpacing: '.08em', cursor: 'pointer' }}
            >
              RETRY
            </button>
          )}

          {phase !== 'done' && (
            <button
              onClick={phase === 'idle' ? startRecording : stopRecording}
              aria-label={phase === 'idle' ? 'Start recording' : 'Stop recording'}
              style={{
                width: 84, height: 84, borderRadius: 99, border: `5px solid ${T.bg}`,
                background: T.promoter, color: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 0 4px ${T.promoter}, 0 0 40px ${T.promoter}80`, cursor: 'pointer',
              }}
            >
              {phase === 'idle' ? Ic.mic(28) : Ic.stop(28)}
            </button>
          )}

          {phase === 'done' && (
            <>
              <button
                onClick={() => onDone(blobRef.current, kind)}
                aria-label="Add to show"
                style={{ width: 84, height: 84, borderRadius: 99, background: T.venue, border: 'none', color: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 24px ${T.venue}55`, cursor: 'pointer' }}
              >
                {Ic.check(28)}
              </button>
            </>
          )}

          {phase === 'idle' && (
            <button
              onClick={onBack}
              style={{ width: 56, height: 56, borderRadius: 99, background: T.bg3, border: 'none', color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}
            >
              {Ic.arrowLeft(18)}
            </button>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.14em', textAlign: 'center', marginTop: 16, fontWeight: 600 }}>
          SAMPLES CAP AT 5 SECONDS · VOICE OVER UNLIMITED
        </div>
      </div>
    </div>
  );
}

// ── Screen 4: Published — on your personal page ───────────────────────────────
function PublishedScreen({ onBack }: { onBack: () => void }) {
  const tracklist = [
    { kind: 'VO',     label: 'Intro · welcome to Halflight', dur: '0:34', color: T.promoter },
    { kind: 'TRACK',  label: 'Sundown — Maya Reyes',         dur: '3:42', color: T.accent },
    { kind: 'SAMPLE', label: 'Crowd · Empty Bottle',         dur: '0:05', color: T.warn },
    { kind: 'TRACK',  label: 'Cobalt Hour — Vela',           dur: '4:18', color: T.venue },
    { kind: 'VO',     label: 'Mid-show patter',              dur: '1:08', color: T.promoter },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, color: T.ink, fontFamily: 'var(--font-dm, sans-serif)', overflow: 'auto' }}>
      {/* Hero */}
      <div style={{ height: 280, position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${T.promoter} 0%, ${T.accent} 60%, ${T.bg3} 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 75% 25%, rgba(255,255,255,.3), transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 50%, ${T.bg} 100%)` }} />
        <div style={{ position: 'absolute', top: 16, left: 0, right: 0, padding: '0 8px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ width: 48, height: 48, borderRadius: 99, background: 'rgba(0,0,0,.45)', color: T.ink, border: 'none', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {Ic.arrowLeft(20)}
          </button>
          <button style={{ width: 48, height: 48, borderRadius: 99, background: 'rgba(0,0,0,.45)', color: T.ink, border: 'none', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {Ic.share(18)}
          </button>
        </div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 34 }}>
          <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.bg, letterSpacing: '.16em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: T.bg, display: 'inline-block' }} />
            LIVE · ON YOUR PAGE · 218 LISTENING
          </div>
          <div style={{ fontWeight: 400, fontSize: 30, color: T.bg, lineHeight: 1.1 }}>EP 05 · Tonight is fine</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,.65)', marginTop: 4 }}>Halflight FM · 31 min · 8 tracks · 2 VOs</div>
        </div>
      </div>

      {/* Play row */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ width: 60, height: 60, borderRadius: 99, background: T.promoter, color: T.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${T.promoter}55`, cursor: 'pointer' }}>
          {Ic.play(22)}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Preview · plays for fans</div>
          <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 11, color: T.ink3, marginTop: 3, letterSpacing: '.06em' }}>ihype.org/halflight-fm/05</div>
        </div>
      </div>

      {/* Action grid */}
      <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { icon: Ic.rocket(16), label: 'Promote', color: T.promoter, bg: `${T.promoter}18`, border: `${T.promoter}40` },
          { icon: Ic.share(15),  label: 'Share link', color: T.ink, bg: T.bg2, border: 'rgba(255,255,255,.14)' },
          { icon: Ic.archive(15), label: 'Archive', color: T.ink2, bg: T.bg2, border: 'rgba(255,255,255,.06)' },
          { icon: Ic.trash(15),  label: 'Delete', color: '#ff6b5a', bg: 'transparent', border: '#ff6b5a40' },
        ].map((a, i) => (
          <button key={i} style={{ height: 54, borderRadius: 18, background: a.bg, color: a.color, border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: i < 1 ? 600 : 500, cursor: 'pointer' }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ padding: '0 22px 16px', display: 'flex', gap: 20 }}>
        {[
          { n: '1,284', l: 'PLAYS · 24H',  c: T.ink },
          { n: '186',   l: 'HYPED FROM',   c: T.accent },
          { n: '$24',   l: 'EARNED · 45%', c: T.fan },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: 'var(--font-syne, sans-serif)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: s.c, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: T.ink3, marginTop: 4, letterSpacing: '.14em', fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tracklist */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 10, color: T.ink3, letterSpacing: '.16em', fontWeight: 600, padding: '0 6px 10px' }}>
          SHOW LINE · {tracklist.length} BLOCKS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tracklist.map((b, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'var(--font-syne, sans-serif)', fontWeight: 800, fontSize: 13, color: T.ink3, width: 22 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ width: 6, height: 36, borderRadius: 99, background: b.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 9, color: b.color, letterSpacing: '.14em', fontWeight: 700 }}>{b.kind}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-jb, monospace)', fontSize: 11, color: T.ink2, flexShrink: 0 }}>{b.dur}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root shell — routes between the 4 screens ─────────────────────────────────
export function RadioStudio() {
  const [screen, setScreen] = useState<Screen>('studio');

  function addRecordedBlock(blob: Blob | null, kind: 'voice' | 'sample') {
    // blob would be uploaded to /api/media in production
    setScreen('builder');
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: T.bg, color: T.ink,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-dm, Roboto, sans-serif)',
      }}
    >
      {screen === 'studio' && (
        <StudioScreen
          onOpenBuilder={() => setScreen('builder')}
          onOpenPublished={() => setScreen('published')}
        />
      )}
      {screen === 'builder' && (
        <BuilderScreen
          onBack={() => setScreen('studio')}
          onRecord={() => setScreen('record')}
          onPublish={() => setScreen('published')}
        />
      )}
      {screen === 'record' && (
        <RecordScreen
          onBack={() => setScreen('builder')}
          onDone={(blob, kind) => addRecordedBlock(blob, kind)}
        />
      )}
      {screen === 'published' && (
        <PublishedScreen onBack={() => setScreen('studio')} />
      )}
    </div>
  );
}
