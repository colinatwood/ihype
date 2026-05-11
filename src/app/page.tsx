'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const TRACKS = [
  { t: 'Sundown', a: 'Maya Reyes', d: '3:24', h: 142, c: '#ff5029' },
  { t: 'Westline', a: 'Cobalt Hour', d: '4:11', h: 89, c: '#b983ff' },
  { t: 'Gold Teeth', a: 'Vela', d: '2:58', h: 67, c: '#22e5d4' },
  { t: 'Slow Burn', a: 'The Lowriders', d: '3:42', h: 211, c: '#ff3e9a' },
  { t: 'Cassette Heart', a: 'Juno North', d: '3:09', h: 54, c: '#ffb84a' },
  { t: 'Underpass', a: 'Saint Hex', d: '4:36', h: 128, c: '#7fb3ff' },
  { t: 'Halflight', a: 'Maya Reyes', d: '3:51', h: 76, c: '#ff5029' },
  { t: 'Brass City', a: 'Cobalt Hour', d: '3:18', h: 33, c: '#b983ff' },
];

const ROLES = [
  { k: 'fan', label: 'Fan', sub: 'Hype · Top 5 · Playlists', c: '#b983ff', icon: '♡' },
  { k: 'artist', label: 'Artist', sub: 'Upload · Tour · Merch', c: '#ff5029', icon: '◐' },
  { k: 'venue', label: 'Venue', sub: 'Host · Verify · Issue tickets', c: '#22e5d4', icon: '◇' },
  { k: 'promoter', label: 'Promoter / DJ', sub: 'Book · Affiliate · Radio shows', c: '#ff3e9a', icon: '◉' },
];

const SHOWS = [
  { name: 'Maya Reyes · Empty Bottle', date: 'Thu Jun 18 · 9PM', hype: 412, status: 'LIVE' },
  { name: 'Cobalt Hour · Sleeping Village', date: 'Sat Jun 20 · 8PM', hype: 287, status: 'SOON' },
  { name: 'Vela · Subterranean', date: 'Tue Jun 23 · 8PM', hype: 156, status: 'OPEN' },
  { name: 'Saint Hex · Schubas', date: 'Fri Jun 26 · 10PM', hype: 98, status: 'OPEN' },
  { name: 'Juno North · The Hideout', date: 'Sat Jun 27 · 9PM', hype: 74, status: 'OPEN' },
];

const RADIO = [
  { name: 'Late Night Locals', host: 'DJ Ramona', listeners: 84, c: '#ff3e9a' },
  { name: 'Crate Digger Hour', host: 'Saint Hex', listeners: 62, c: '#7fb3ff' },
  { name: 'Midwest Frequencies', host: 'Cobalt Hour', listeners: 48, c: '#b983ff' },
  { name: 'Underground Dispatch', host: 'Vela', listeners: 31, c: '#22e5d4' },
];

const NAV = [
  { label: 'Discover', icon: '⌕' },
  { label: 'Library', icon: '☰' },
  { label: 'Shows', icon: '◇' },
  { label: 'Radio', icon: '◉' },
  { label: 'Studio', icon: '◐' },
];

type View = 'discover' | 'library' | 'shows' | 'radio' | 'studio';

const S = {
  wrap: { position: 'fixed' as const, top: 106, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: '56px 1fr 320px', gridTemplateRows: '40px 1fr 64px', background: 'var(--bg)', fontFamily: 'var(--f-m, monospace)', overflow: 'hidden' },
  sidebar: { gridRow: '1 / span 3', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '12px 0', gap: 6, background: 'var(--bg)' } as React.CSSProperties,
  sbLogo: { width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#ff5029,#ff3e9a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 14, color: 'var(--bg)', marginBottom: 14, textDecoration: 'none' } as React.CSSProperties,
  sbIcon: { width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 14, position: 'relative' as const, transition: 'background .15s', border: 'none', background: 'transparent' },
  sbIconActive: { background: 'rgba(255,80,41,.1)', color: '#ff5029' } as React.CSSProperties,
  sbIndicator: { position: 'absolute' as const, left: -7, top: '25%', bottom: '25%', width: 2, background: '#ff5029', borderRadius: 2 },
  sbTooltip: { position: 'absolute' as const, left: 46, top: '50%', transform: 'translateY(-50%)', background: '#161310', border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#f2ede8', whiteSpace: 'nowrap' as const, pointerEvents: 'none' as const, letterSpacing: '.06em', zIndex: 300 },
  topbar: { gridColumn: '2 / span 2', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em' } as React.CSSProperties,
  search: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11, color: 'var(--ink-3)', minWidth: 280 } as React.CSSProperties,
  searchKbd: { padding: '1px 5px', background: 'var(--bg-3)', borderRadius: 3, fontSize: 9 } as React.CSSProperties,
  main: { padding: '24px 32px', overflowY: 'auto' as const, minHeight: 0, animation: 'lp-fadein .22s ease' },
  hello: { fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 36, letterSpacing: '-.025em', lineHeight: 1 } as React.CSSProperties,
  helloSub: { fontFamily: 'var(--f-b)', fontSize: 13, color: 'var(--ink-2)', marginTop: 6 } as React.CSSProperties,
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 20 } as React.CSSProperties,
  stat: { padding: '14px 16px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg-2)' } as React.CSSProperties,
  statLabel: { fontSize: 9, letterSpacing: '.16em', color: 'var(--ink-3)', textTransform: 'uppercase' as const, marginBottom: 6 },
  statNum: { fontFamily: 'var(--f-d)', fontSize: 24, fontWeight: 700, letterSpacing: '-.01em' } as React.CSSProperties,
  statDelta: { fontSize: 10, color: '#22e5d4', letterSpacing: '.04em', marginTop: 4 } as React.CSSProperties,
  panelRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 } as React.CSSProperties,
  panel: { border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)', overflow: 'hidden' } as React.CSSProperties,
  panelHead: { padding: '10px 14px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, letterSpacing: '.14em', color: 'var(--ink-3)', textTransform: 'uppercase' as const, fontWeight: 600 },
  panelBody: { padding: '12px 14px' } as React.CSSProperties,
  listRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 12 } as React.CSSProperties,
  listDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 } as React.CSSProperties,
  listMain: { flex: 1, color: 'var(--ink)', fontFamily: 'var(--f-b)', fontSize: 13 } as React.CSSProperties,
  listMeta: { fontSize: 10, color: 'var(--ink-3)' } as React.CSSProperties,
  right: { gridRow: 2, gridColumn: 3, borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' as const, padding: '20px 22px', overflowY: 'auto' as const },
  rPanel: { marginBottom: 20 } as React.CSSProperties,
  rPanelHead: { fontSize: 10, letterSpacing: '.16em', color: 'var(--ink-3)', textTransform: 'uppercase' as const, marginBottom: 10, fontWeight: 600 },
  queueItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 6, cursor: 'pointer' } as React.CSSProperties,
  queueActive: { background: 'rgba(255,80,41,.08)' } as React.CSSProperties,
  qiArt: { width: 30, height: 30, borderRadius: 4, flexShrink: 0 } as React.CSSProperties,
  qiTitle: { fontSize: 12, fontFamily: 'var(--f-b)', fontWeight: 600 } as React.CSSProperties,
  qiArtist: { fontSize: 10, color: 'var(--ink-3)' } as React.CSSProperties,
  qiTime: { fontSize: 10, color: 'var(--ink-3)' } as React.CSSProperties,
  player: { gridColumn: '2 / span 2', borderTop: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 18 } as React.CSSProperties,
  plArt: { width: 46, height: 46, borderRadius: 5, flexShrink: 0 } as React.CSSProperties,
  plMeta: { minWidth: 160 } as React.CSSProperties,
  plTitle: { fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-d)', letterSpacing: 'normal' } as React.CSSProperties,
  plArtist: { fontSize: 10, color: 'var(--ink-3)', marginTop: 2 } as React.CSSProperties,
  plCtrl: { display: 'flex', alignItems: 'center', gap: 14, flex: 1, justifyContent: 'center' } as React.CSSProperties,
  plBtn: { color: 'var(--ink-3)', cursor: 'pointer', fontSize: 14, background: 'none', border: 'none', padding: 0 } as React.CSSProperties,
  plPlay: { width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' } as React.CSSProperties,
  plScrub: { flex: 1, maxWidth: 340, height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, position: 'relative' as const },
  plScrubF: { position: 'absolute' as const, inset: 0, width: '34%', background: 'var(--ink)', borderRadius: 2 },
  plTime: { fontSize: 10, color: 'var(--ink-3)' } as React.CSSProperties,
  plRight: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--ink-3)' } as React.CSSProperties,
  viewHead: { fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', marginBottom: 4 } as React.CSSProperties,
  viewSub: { fontSize: 12, color: 'var(--ink-3)', marginBottom: 20 } as React.CSSProperties,
  cta: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#ff5029', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '.04em' } as React.CSSProperties,
  ctaGhost: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1px solid var(--line)', color: 'var(--ink-2)', borderRadius: 8, fontSize: 12, textDecoration: 'none', letterSpacing: '.04em' } as React.CSSProperties,
};

function ViewDiscover({ idx, setIdx }: { idx: number; setIdx: (i: number) => void }) {
  return (
    <>
      <div style={S.hello}>Independent music,<br />found by humans.</div>
      <div style={S.helloSub}>
        Not-for-profit · free forever · built for the scene.{' '}
        <Link href="/register" style={{ color: '#ff5029', textDecoration: 'none' }}>Join free →</Link>
      </div>
      <div style={S.statRow}>
        <div style={S.stat}>
          <div style={S.statLabel}>TRACKS HYPED</div>
          <div style={S.statNum}>1,247</div>
          <div style={S.statDelta}>this week</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>SHOWS LISTED</div>
          <div style={S.statNum}>184</div>
          <div style={{ ...S.statDelta, color: '#ffb84a' }}>↑ 12 this week</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>RADIO SHOWS</div>
          <div style={S.statNum}>23</div>
          <div style={S.statDelta}>live right now</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>CITIES</div>
          <div style={S.statNum}>41</div>
          <div style={{ ...S.statDelta, color: '#b983ff' }}>and growing</div>
        </div>
      </div>
      <div style={S.panelRow}>
        <div style={S.panel}>
          <div style={S.panelHead}><span>TONIGHT IN CHICAGO</span><span>3 SHOWS</span></div>
          <div style={S.panelBody}>
            {SHOWS.slice(0, 3).map((s, i) => (
              <div key={i} style={S.listRow}>
                <div style={{ ...S.listDot, background: s.status === 'LIVE' ? '#22e5d4' : s.status === 'SOON' ? '#ffb84a' : 'var(--ink-3)' }} />
                <div style={S.listMain}>{s.name}</div>
                <div style={S.listMeta}>{s.date.split(' · ')[1]} · ♡{s.hype}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.panel}>
          <div style={S.panelHead}><span>YOUR ROLES</span><span>PICK ONE</span></div>
          <div style={S.panelBody}>
            {ROLES.map(r => (
              <Link key={r.k} href={`/register?role=${r.k}`} style={{ ...S.listRow, textDecoration: 'none', display: 'flex' }}>
                <div style={{ ...S.listDot, background: r.c }} />
                <div style={S.listMain}>{r.label} <span style={{ color: 'var(--ink-3)', fontSize: 10 }}>· {r.sub}</span></div>
                <div style={{ ...S.listMeta, color: '#ff5029' }}>join →</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div style={{ ...S.panelRow, gridTemplateColumns: '1fr' }}>
        <div style={S.panel}>
          <div style={S.panelHead}><span>HYPED TRACKS THIS WEEK</span><span>VIEW ALL →</span></div>
          <div style={S.panelBody}>
            {TRACKS.slice(0, 4).map((t, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{ ...S.listRow, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 24, height: 24, borderRadius: 3, background: `linear-gradient(135deg, ${t.c}, ${t.c}80)`, flexShrink: 0 }} />
                <div style={S.listMain}>{t.t} <span style={{ color: 'var(--ink-3)', fontSize: 10, marginLeft: 6 }}>{t.a}</span></div>
                <div style={S.listMeta}>♡ {t.h}</div>
                <div style={S.listMeta}>{t.d}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ViewLibrary() {
  return (
    <>
      <div style={S.viewHead}>Your Library</div>
      <div style={S.viewSub}>Playlists, hyped tracks, and saved shows live here once you sign in.</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <Link href="/register" style={S.cta}>Create account</Link>
        <Link href="/login" style={S.ctaGhost}>Sign in</Link>
      </div>
      <div style={S.panel}>
        <div style={S.panelHead}><span>POPULAR PLAYLISTS</span><span>PREVIEW</span></div>
        <div style={S.panelBody}>
          {[
            { name: 'Chicago Locals 2026', tracks: 24, curator: 'iHYPE Staff', c: '#ff5029' },
            { name: 'Late Night Hypno', tracks: 18, curator: 'DJ Ramona', c: '#b983ff' },
            { name: 'Midwest Emerging', tracks: 31, curator: 'Saint Hex', c: '#22e5d4' },
          ].map((pl, i) => (
            <div key={i} style={S.listRow}>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: `linear-gradient(135deg, ${pl.c}, ${pl.c}80)`, flexShrink: 0 }} />
              <div style={S.listMain}>{pl.name} <span style={{ color: 'var(--ink-3)', fontSize: 10 }}>by {pl.curator}</span></div>
              <div style={S.listMeta}>{pl.tracks} tracks</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ViewShows() {
  return (
    <>
      <div style={S.viewHead}>Shows</div>
      <div style={S.viewSub}>Upcoming and live events in your area.</div>
      <div style={{ ...S.panel, marginBottom: 12 }}>
        <div style={S.panelHead}><span>ALL UPCOMING</span><span>{SHOWS.length} SHOWS</span></div>
        <div style={S.panelBody}>
          {SHOWS.map((s, i) => (
            <div key={i} style={{ ...S.listRow, borderBottom: i < SHOWS.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ ...S.listDot, width: 8, height: 8, background: s.status === 'LIVE' ? '#22e5d4' : s.status === 'SOON' ? '#ffb84a' : 'var(--ink-3)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...S.listMain, marginBottom: 2 }}>{s.name}</div>
                <div style={S.listMeta}>{s.date}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <span style={{ fontSize: 9, letterSpacing: '.12em', padding: '2px 6px', borderRadius: 3, background: s.status === 'LIVE' ? 'rgba(34,229,212,.15)' : 'var(--bg-3)', color: s.status === 'LIVE' ? '#22e5d4' : 'var(--ink-3)' }}>{s.status}</span>
                <span style={S.listMeta}>♡ {s.hype}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Link href="/register?role=venue" style={S.cta}>List a show</Link>
        <Link href="/shows" style={S.ctaGhost}>Browse all cities</Link>
      </div>
    </>
  );
}

function ViewRadio() {
  return (
    <>
      <div style={S.viewHead}>Radio</div>
      <div style={S.viewSub}>Live and recorded sets from local artists and DJs.</div>
      <div style={S.statRow}>
        {RADIO.map((r, i) => (
          <div key={i} style={{ ...S.stat, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: r.c }} />
            <div style={{ fontSize: 9, letterSpacing: '.14em', color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase' as const }}>LIVE</div>
            <div style={{ fontFamily: 'var(--f-d)', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.name}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>with {r.host}</div>
            <div style={{ fontSize: 10, color: r.c }}>● {r.listeners} listening</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, ...S.panel }}>
        <div style={S.panelHead}><span>RECENT SETS</span><span>ARCHIVE</span></div>
        <div style={S.panelBody}>
          {TRACKS.slice(0, 3).map((t, i) => (
            <div key={i} style={S.listRow}>
              <div style={{ ...S.listDot, background: t.c }} />
              <div style={S.listMain}>{t.a} — Live Set <span style={{ color: 'var(--ink-3)', fontSize: 10 }}>· {t.d}</span></div>
              <div style={S.listMeta}>May {10 + i}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ViewStudio() {
  return (
    <>
      <div style={S.viewHead}>Studio</div>
      <div style={S.viewSub}>Upload tracks, manage your shows, and track hype as an artist.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '◐', label: 'Upload Track', sub: 'Stream-quality audio, no limits', c: '#ff5029', href: '/register?role=artist' },
          { icon: '◇', label: 'List a Show', sub: 'Tickets, RSVP, or free entry', c: '#22e5d4', href: '/register?role=venue' },
          { icon: '◉', label: 'Start Radio', sub: 'Live or recorded DJ sets', c: '#ff3e9a', href: '/register?role=promoter' },
          { icon: '☰', label: 'Artist Profile', sub: 'Bio, links, press kit', c: '#b983ff', href: '/register?role=artist' },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ ...S.panel, padding: '16px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 22, marginBottom: 8, color: item.c }}>{item.icon}</div>
            <div style={{ fontFamily: 'var(--f-d)', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{item.sub}</div>
          </Link>
        ))}
      </div>
      <div style={{ padding: '16px 20px', background: 'rgba(255,80,41,.06)', border: '1px solid rgba(255,80,41,.2)', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>iHYPE is free for artists.</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 12 }}>No streaming cuts. No paywalls. Built by and for the independent music scene.</div>
        <Link href="/register?role=artist" style={S.cta}>Get started free →</Link>
      </div>
    </>
  );
}

export default function LandingPage() {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<View>('discover');
  const track = TRACKS[idx];

  const viewLabel = view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <>
      <style>{`@keyframes lp-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.wrap}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          <Link href="/" style={S.sbLogo}>iH</Link>
          {NAV.map((n) => {
            const isActive = view === n.label.toLowerCase();
            return (
              <button
                key={n.label}
                style={{ ...S.sbIcon, ...(isActive ? S.sbIconActive : {}) }}
                onMouseEnter={() => setHovered(n.label)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setView(n.label.toLowerCase() as View)}
                title={n.label}
                type="button"
              >
                {isActive && <div style={S.sbIndicator} />}
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {hovered === n.label && <span style={S.sbTooltip}>{n.label}</span>}
              </button>
            );
          })}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.08em', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>

        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--ink-3)' }}>iHYPE</span>
            <span style={{ color: 'var(--ink-3)' }}>/</span>
            <span style={{ color: 'var(--ink)' }}>{viewLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22e5d4' }}>
            ● 1,284 listening
          </div>
          <div style={S.search}>
            <span>⌕</span>
            <span>Search artists, shows, venues, tracks…</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              <span style={S.searchKbd}>⌘</span><span style={S.searchKbd}>K</span>
            </span>
          </div>
        </div>

        {/* Main — key on view triggers remount → animation reruns */}
        <div key={view} style={S.main}>
          {view === 'discover' && <ViewDiscover idx={idx} setIdx={setIdx} />}
          {view === 'library' && <ViewLibrary />}
          {view === 'shows' && <ViewShows />}
          {view === 'radio' && <ViewRadio />}
          {view === 'studio' && <ViewStudio />}
        </div>

        {/* Right column */}
        <div style={S.right}>
          <div style={S.rPanel}>
            <div style={S.rPanelHead}>NOW HYPED</div>
            <div style={{ padding: 14, background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 6, background: `linear-gradient(135deg, ${track.c}, ${track.c}80)`, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,.25), transparent 60%)' }} />
              </div>
              <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 16 }}>{track.t}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{track.a.toUpperCase()}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Link href="/register" style={{ flex: 1, padding: 7, background: 'var(--ink)', color: 'var(--bg)', borderRadius: 6, fontSize: 11, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>Join to hype</Link>
                <div style={{ padding: '7px 10px', border: `1px solid ${track.c}`, color: track.c, borderRadius: 6, fontSize: 11 }}>♡ {track.h}</div>
              </div>
            </div>
          </div>
          <div style={S.rPanel}>
            <div style={S.rPanelHead}>QUEUE · {TRACKS.length} TRACKS</div>
            {TRACKS.map((t, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{ ...S.queueItem, width: '100%', background: i === idx ? 'rgba(255,80,41,.08)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ ...S.qiArt, background: `linear-gradient(135deg, ${t.c}, ${t.c}80)` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.qiTitle}>{t.t}</div>
                  <div style={S.qiArtist}>{t.a}</div>
                </div>
                <div style={S.qiTime}>{t.d}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Player dock */}
        <div style={S.player}>
          <div style={{ ...S.plArt, background: `linear-gradient(135deg, ${track.c}, ${track.c}80)` }} />
          <div style={S.plMeta}>
            <div style={S.plTitle}>{track.t}</div>
            <div style={S.plArtist}>{track.a.toUpperCase()}</div>
          </div>
          <div style={S.plCtrl}>
            <button style={S.plBtn}>⏮</button>
            <button style={S.plPlay}>▶</button>
            <button style={S.plBtn}>⏭</button>
            <span style={S.plTime}>0:00</span>
            <div style={S.plScrub}><div style={S.plScrubF} /></div>
            <span style={S.plTime}>{track.d}</span>
          </div>
          <div style={S.plRight}>
            <span style={{ color: '#ff3e9a', display: 'flex', alignItems: 'center', gap: 4 }}>♡ {track.h}</span>
            <span>SHUFFLE</span>
            <span>REPEAT</span>
            <Link href="/login" style={{ color: 'var(--ink-2)', textDecoration: 'none', letterSpacing: '.06em' }}>SIGN IN →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
