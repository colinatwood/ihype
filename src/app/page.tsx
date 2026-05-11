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
];

const NAV = [
  { label: 'Discover', icon: '⌕' },
  { label: 'Library', icon: '☰' },
  { label: 'Shows', icon: '◇' },
  { label: 'Radio', icon: '◉' },
  { label: 'Studio', icon: '◐' },
];

const S = {
  wrap: { width: '100%', height: '100vh', display: 'grid', gridTemplateColumns: '56px 1fr 320px', gridTemplateRows: '40px 1fr 64px', background: 'var(--bg)', fontFamily: 'var(--f-m, monospace)', overflow: 'hidden' } as React.CSSProperties,
  sidebar: { gridRow: '1 / span 3', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 6 } as React.CSSProperties,
  sbLogo: { width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#ff5029,#ff3e9a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 14, color: 'var(--bg)', marginBottom: 14, textDecoration: 'none' } as React.CSSProperties,
  sbIcon: { width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 14, position: 'relative', transition: 'background .15s' } as React.CSSProperties,
  sbIconActive: { background: 'rgba(255,80,41,.1)', color: '#ff5029' } as React.CSSProperties,
  sbIndicator: { position: 'absolute', left: -7, top: '25%', bottom: '25%', width: 2, background: '#ff5029', borderRadius: 2 } as React.CSSProperties,
  topbar: { gridColumn: '2 / span 2', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.06em' } as React.CSSProperties,
  search: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 11, color: 'var(--ink-3)', minWidth: 280 } as React.CSSProperties,
  searchKbd: { padding: '1px 5px', background: 'var(--bg-3)', borderRadius: 3, fontSize: 9 } as React.CSSProperties,
  main: { padding: '24px 32px', overflowY: 'auto' as const, minHeight: 0 },
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
};

export default function LandingPage() {
  const [idx, setIdx] = useState(0);
  const track = TRACKS[idx];

  return (
    <div style={S.wrap}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <Link href="/" style={S.sbLogo}>iH</Link>
        {NAV.map((n, i) => (
          <div key={n.label} style={{ ...S.sbIcon, ...(i === 0 ? S.sbIconActive : {}) }} title={n.label}>
            {i === 0 && <div style={S.sbIndicator} />}
            <span style={{ fontSize: 16 }}>{n.icon}</span>
          </div>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Link href="/login" style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.08em', textDecoration: 'none' }}>IN</Link>
        </div>
      </div>

      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-3)' }}>iHYPE</span>
          <span style={{ color: 'var(--ink-3)' }}>/</span>
          <span style={{ color: 'var(--ink)' }}>Home</span>
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

      {/* Main */}
      <div style={S.main}>
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
              {SHOWS.map((s, i) => (
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
            <button key={i} onClick={() => setIdx(i)} style={{ ...S.queueItem, ...(i === idx ? S.queueActive : {}), width: '100%', background: i === idx ? 'rgba(255,80,41,.08)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
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
  );
}
