'use client';

import { useState, useMemo, useRef, memo, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────
type Tab = 'identity' | 'cover' | 'splits' | 'when' | 'who' | 'publish';

type ShowData = {
  title: string;
  station: string;
  ep: string;
  freq: string;
  desc: string;
  tags: string[];
  cover: string;
  schedule: string;
  when: { d: number; h: number };
  publishMode: string;
};

// ── Color palette ──────────────────────────────────────────────
const C = {
  accent: '#ff5029', pink: '#ff3e9a', teal: '#22e5d4',
  purple: '#b983ff', amber: '#ffb84a', blue: '#7fb3ff',
} as const;

const COVER_PALETTES: Array<[string, string, string]> = [
  ['pink,accent',   C.pink,   C.accent],
  ['accent,amber',  C.accent, C.amber],
  ['purple,pink',   C.purple, C.pink],
  ['teal,blue',     C.teal,   C.blue],
  ['amber,accent',  C.amber,  C.accent],
  ['blue,purple',   C.blue,   C.purple],
  ['teal,pink',     C.teal,   C.pink],
  ['purple,blue',   C.purple, C.blue],
  ['pink,amber',    C.pink,   C.amber],
  ['accent,teal',   C.accent, C.teal],
  ['amber,purple',  C.amber,  C.purple],
  ['accent,pink',   C.accent, C.pink],
];

function coverGrad(key: string) {
  const [a, b] = key.split(',') as [keyof typeof C, keyof typeof C];
  return `linear-gradient(135deg, ${C[a]}, ${C[b]})`;
}

const XP_PER: Record<Tab, number> = {
  identity: 30, cover: 15, splits: 15, when: 20, who: 20, publish: 100,
};
const TOTAL_XP = 200;

// ── Heatmap cell colours ───────────────────────────────────────
const HEAT_BG = [
  'var(--wb-bg-3)',
  'rgba(255,62,154,.18)',
  'rgba(255,62,154,.40)',
  'rgba(255,62,154,.65)',
  '#ff3e9a',
] as const;

// ── Main component ─────────────────────────────────────────────
export const RadioShowCreator = memo(function RadioShowCreator() {
  const [tab, setTab] = useState<Tab>('when');
  const [done, setDone] = useState<Record<Tab, boolean>>({
    identity: true, cover: true, splits: true, when: false, who: false, publish: false,
  });
  const [xp, setXp] = useState(60);
  const [levelUp, setLevelUp] = useState(false);
  const [xpPops, setXpPops] = useState<Array<{ id: number; text: string }>>([]);
  const popId = useRef(0);

  const [show, setShow] = useState<ShowData>({
    title: 'Tonight is fine',
    station: 'Halflight FM',
    ep: '05',
    freq: '87.3',
    desc: "Solo episode. Tracks from the Halflight EP plus three covers I tracked into the Tascam this week. New Lowriders single sneaks in at the end.",
    tags: ['indie folk', 'slowcore', 'chicago', 'late night'],
    cover: 'pink,accent',
    schedule: 'Sun · 10AM',
    when: { d: 0, h: 10 },
    publishMode: 'promote',
  });

  const [chips, setChips] = useState<Record<string, boolean>>({
    'Chicago': true, 'Milwaukee': true, 'Detroit': true, 'Minneapolis': false, 'Brooklyn': false,
    'Indie': true, 'Folk': true, 'Slowcore': true, 'Ambient': false, 'Lo-fi': false,
    'Followers · 218': true, 'Hyped your tracks · 412': true, "Co-host's followers": false, 'Past listeners': false,
  });

  const [tagInput, setTagInput] = useState('');

  const xpPct = Math.min(100, Math.round(xp / TOTAL_XP * 100));
  const doneCount = (Object.keys(done) as Tab[]).filter(k => k !== 'publish' && done[k]).length;

  const reach = useMemo(() => {
    const on = Object.values(chips).filter(Boolean).length;
    const raw = 800 + on * 540;
    return raw >= 1000 ? `${(raw / 1000).toFixed(1)}k` : String(raw);
  }, [chips]);

  // Stable heatmap data (deterministic, no random)
  const heatData = useMemo<number[][]>(() => {
    const grid: number[][] = [];
    for (let d = 0; d < 7; d++) {
      const row: number[] = [];
      for (let h = 0; h < 24; h++) {
        let v = 0.3;
        if (h >= 18 && h <= 23) v = 3;
        else if (h >= 8 && h <= 11) v = 2;
        else if (h >= 12 && h <= 17) v = 1.5;
        if (d === 0 || d === 6) v *= 1.3;
        v += Math.sin(d * 1.3 + h * 0.8) * 0.4;
        row.push(Math.max(0, Math.min(4, Math.round(v))));
      }
      grid.push(row);
    }
    grid[0][10] = 4;
    return grid;
  }, []);

  const markDone = useCallback((t: Tab) => {
    setDone(prev => {
      if (prev[t]) return prev;
      const earned = XP_PER[t];
      setXp(x => {
        const next = x + earned;
        if (next >= TOTAL_XP && x < TOTAL_XP) setTimeout(() => setLevelUp(true), 600);
        return next;
      });
      const id = ++popId.current;
      setXpPops(p => [...p, { id, text: `+${earned} XP` }]);
      setTimeout(() => setXpPops(p => p.filter(x => x.id !== id)), 1400);
      return { ...prev, [t]: true };
    });
  }, []);

  function addTag(text: string) {
    const t = text.trim().toLowerCase();
    if (!t || show.tags.includes(t)) return;
    setShow(s => ({ ...s, tags: [...s.tags, t] }));
    markDone('identity');
  }

  function removeTag(t: string) {
    setShow(s => ({ ...s, tags: s.tags.filter(x => x !== t) }));
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  }

  function toggleChip(key: string) {
    setChips(prev => ({ ...prev, [key]: !prev[key] }));
    markDone('who');
  }

  function selectCoverPalette(key: string) {
    setShow(s => ({ ...s, cover: key }));
    markDone('cover');
  }

  function selectSchedule(schedule: string, when: { d: number; h: number }) {
    setShow(s => ({ ...s, schedule, when }));
    markDone('when');
  }

  function selectPublishMode(mode: string) {
    setShow(s => ({ ...s, publishMode: mode }));
    markDone('publish');
  }

  const coverStyle: React.CSSProperties = {
    aspectRatio: '1',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 24px 48px -10px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: coverGrad(show.cover),
    cursor: 'grab',
    userSelect: 'none',
  };

  // ── Tab panels ─────────────────────────────────────────────
  function renderIdentity() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EdHead title="Identity" sub="Name it, station it, frequency it. These show up on your page and in everyone's feed." xp={30} done={done.identity} />
        <Field label="SHOW TITLE">
          <input
            value={show.title}
            onChange={e => { setShow(s => ({ ...s, title: e.target.value })); markDone('identity'); }}
            style={{ ...inputStyle, fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 20 }}
          />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="STATION">
            <input value={show.station} onChange={e => { setShow(s => ({ ...s, station: e.target.value })); markDone('identity'); }} style={inputStyle} />
          </Field>
          <Field label="EPISODE">
            <input value={show.ep} onChange={e => { setShow(s => ({ ...s, ep: e.target.value })); markDone('identity'); }} style={inputStyle} />
          </Field>
          <Field label="FREQUENCY">
            <input value={show.freq} onChange={e => { setShow(s => ({ ...s, freq: e.target.value })); markDone('identity'); }} style={inputStyle} />
          </Field>
        </div>
        <Field label="DESCRIPTION" hint="why fans should hit play tonight">
          <textarea
            rows={3}
            value={show.desc}
            onChange={e => { setShow(s => ({ ...s, desc: e.target.value })); markDone('identity'); }}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </Field>
        <Field label="TAGS" hint="help fans find this on Discover">
          <div style={{ background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', borderRadius: 8, padding: '6px 8px', display: 'flex', flexWrap: 'wrap', gap: 5, minHeight: 42, alignItems: 'center' }}>
            {show.tags.map(t => (
              <span key={t} style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(255,62,154,.12)', color: C.pink, border: '1px solid rgba(255,62,154,.3)', fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                {t}
                <span role="button" tabIndex={0} aria-label={`Remove ${t}`} onClick={() => removeTag(t)} onKeyDown={e => e.key === 'Enter' && removeTag(t)} style={{ cursor: 'pointer', opacity: 0.6 }}>×</span>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="Add a tag…"
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, minWidth: 80, fontFamily: 'var(--f-b)', fontSize: 13, color: 'var(--wb-ink)', padding: '3px 4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginTop: 5 }}>
            <span style={{ fontFamily: 'var(--f-m)', fontSize: 9, color: 'var(--wb-ink-3)', letterSpacing: '.12em', fontWeight: 600 }}>TRY ·</span>
            {['shoegaze', 'midwest', 'confessional', 'tape hiss'].filter(s => !show.tags.includes(s)).map(s => (
              <button key={s} onClick={() => { setShow(d => ({ ...d, tags: [...d.tags, s] })); markDone('identity'); }} style={{ padding: '2px 8px', borderRadius: 99, background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', color: 'var(--wb-ink-3)', fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                + {s}
              </button>
            ))}
          </div>
        </Field>
      </div>
    );
  }

  function renderCover() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EdHead title="Cover" sub="Pick a palette + texture. The preview updates live on the left." xp={15} done={done.cover} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="PALETTE">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
              {COVER_PALETTES.map(([key, a, b]) => (
                <button
                  key={key}
                  onClick={() => selectCoverPalette(key)}
                  style={{ aspectRatio: '1', borderRadius: 7, background: `linear-gradient(135deg, ${a}, ${b})`, border: show.cover === key ? '2px solid var(--wb-ink)' : '2px solid transparent', cursor: 'pointer', transition: 'transform .12s' }}
                  aria-label={key}
                />
              ))}
            </div>
          </Field>
          <Field label="TEXTURE">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'SOLID', icon: '—' },
                { label: 'HALO', icon: '◎' },
                { label: 'LINES', icon: '≡' },
                { label: 'WAVE', icon: '∿' },
              ].map(({ label, icon }) => (
                <button key={label} style={{ height: 46, borderRadius: 8, background: label === 'SOLID' ? 'rgba(255,62,154,.1)' : 'var(--wb-bg-3)', border: `1px solid ${label === 'SOLID' ? C.pink : 'var(--wb-line)'}`, color: label === 'SOLID' ? C.pink : 'var(--wb-ink-2)', fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>{label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button style={{ flex: 1, height: 36, borderRadius: 8, background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', color: 'var(--wb-ink-2)', fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>↑ UPLOAD</button>
              <button onClick={() => { const i = Math.floor(Math.random() * COVER_PALETTES.length); selectCoverPalette(COVER_PALETTES[i][0]); }} style={{ flex: 1, height: 36, borderRadius: 8, background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', color: 'var(--wb-ink-2)', fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>↺ SHUFFLE</button>
            </div>
          </Field>
        </div>
      </div>
    );
  }

  function renderSplits() {
    const splits = [
      { label: 'Featured artists', sub: 'Auto-split across tracks · paid per play', pct: 45, color: C.accent },
      { label: 'You · host', sub: 'Paid weekly', pct: 45, color: C.purple },
      { label: 'Co-host or referrers', sub: 'Add named co-host · or 10% to anyone who shares', pct: 10, color: C.pink },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EdHead title="Splits" sub="45 / 45 / 10. Auto-applied to every play, pre-roll, paid listen. iHYPE takes 0%." xp={15} done={done.splits} />
        <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden' }}>
          {splits.map(s => (
            <div key={s.label} style={{ flex: s.pct, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 8, fontWeight: 700, color: 'var(--wb-bg)', letterSpacing: '.06em' }}>{s.pct}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {splits.map(s => (
            <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', borderRadius: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'block' }} />
              <div>
                <div style={{ fontFamily: 'var(--f-b)', fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--wb-ink-3)', marginTop: 2, letterSpacing: '.04em' }}>{s.sub}</div>
              </div>
              <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', color: s.color }}>{s.pct}%</div>
            </div>
          ))}
        </div>
        <button style={{ marginTop: 4, height: 40, width: '100%', borderRadius: 8, background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', color: 'var(--wb-ink-2)', fontFamily: 'var(--f-m)', fontSize: 10, fontWeight: 600, cursor: 'pointer', letterSpacing: '.08em' }}>
          + ADD CO-HOST
        </button>
      </div>
    );
  }

  function renderWhen() {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const quickSlots = [
      { label: 'Right now', d: -1, h: -1 },
      { label: 'Sun · 10AM', d: 0, h: 10 },
      { label: 'Custom', d: -2, h: -2 },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EdHead title="When does it air?" sub="Pick a slot. The heatmap shows when your followers are listening — pink = peak." xp={20} done={done.when} />
        <div style={{ display: 'flex', gap: 6 }}>
          {quickSlots.map(slot => {
            const isOn = slot.d >= 0 && show.when.d === slot.d && show.when.h === slot.h;
            return (
              <button
                key={slot.label}
                onClick={() => {
                  if (slot.d >= 0) selectSchedule(slot.label, { d: slot.d, h: slot.h });
                }}
                style={{ flex: 1, padding: '8px', borderRadius: 7, background: isOn ? 'rgba(255,62,154,.1)' : 'var(--wb-bg-3)', border: `1px solid ${isOn ? C.pink : 'var(--wb-line)'}`, color: isOn ? C.pink : 'var(--wb-ink-2)', fontFamily: 'var(--f-b)', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, color: 'var(--wb-ink-3)', letterSpacing: '.14em', fontWeight: 700, marginBottom: 8 }}>LISTENER HEATMAP · CHICAGO</div>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 3 }}>
            {heatData.map((row, d) => (
              <div key={d} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ width: 26, fontFamily: 'var(--f-m)', fontSize: 9, color: 'var(--wb-ink-3)', letterSpacing: '.06em', fontWeight: 600, flexShrink: 0 }}>{days[d]}</span>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
                  {row.map((v, h) => {
                    const isSel = show.when.d === d && show.when.h === h;
                    return (
                      <button
                        key={h}
                        onClick={() => {
                          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                          const hr = h === 0 ? '12AM' : h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`;
                          selectSchedule(`${dayNames[d]} · ${hr}`, { d, h });
                        }}
                        aria-label={`${days[d]} ${h}:00`}
                        style={{
                          aspectRatio: '1',
                          borderRadius: 2,
                          background: HEAT_BG[Math.min(v, 4)],
                          cursor: 'pointer',
                          border: 'none',
                          outline: isSel ? '1.5px solid var(--wb-ink)' : 'none',
                          outlineOffset: isSel ? 1 : 0,
                          transition: 'transform .1s',
                          boxShadow: v === 4 ? `0 0 5px rgba(255,62,154,.4)` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <div style={{ width: 26, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--f-m)', fontSize: 8, color: 'var(--wb-ink-3)', letterSpacing: '.04em', padding: '0 2px' }}>
              <span>6A</span><span>12P</span><span>6P</span><span>12A</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontFamily: 'var(--f-m)', fontSize: 9, color: 'var(--wb-ink-3)', letterSpacing: '.1em', fontWeight: 600 }}>
            <span>QUIET</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {HEAT_BG.map((bg, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
              ))}
            </div>
            <span>PEAK · 1.4K LISTENING</span>
          </div>
        </div>
      </div>
    );
  }

  function renderWho() {
    const groups = [
      { label: 'CITIES', keys: ['Chicago', 'Milwaukee', 'Detroit', 'Minneapolis', 'Brooklyn', '+ Add'] },
      { label: 'VIBES', keys: ['Indie', 'Folk', 'Slowcore', 'Ambient', 'Lo-fi', '+ Add'] },
      { label: 'YOUR FANS', keys: ['Followers · 218', 'Hyped your tracks · 412', "Co-host's followers", 'Past listeners'] },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EdHead title="Who hears it first?" sub="We ping these fans the moment your show airs. Toggle to widen or tighten reach." xp={20} done={done.who} />
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, color: 'var(--wb-ink-3)', letterSpacing: '.14em', fontWeight: 700, marginBottom: 6 }}>{g.label}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {g.keys.map(key => {
                const isAdd = key === '+ Add';
                const on = !isAdd && chips[key];
                return (
                  <button
                    key={key}
                    onClick={() => !isAdd && toggleChip(key)}
                    style={{ padding: '4px 10px', borderRadius: 99, background: on ? 'rgba(34,229,212,.1)' : 'var(--wb-bg-3)', color: on ? C.teal : isAdd ? 'var(--wb-ink-3)' : 'var(--wb-ink-2)', border: `1px solid ${on ? 'rgba(34,229,212,.4)' : 'var(--wb-line)'}`, fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', cursor: 'pointer' }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '10px 12px', background: 'rgba(34,229,212,.06)', border: '1px solid rgba(34,229,212,.2)', borderRadius: 8, marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: C.teal, lineHeight: 1 }}>{reach}</span>
          <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--wb-ink-2)', letterSpacing: '.12em', fontWeight: 600 }}>FANS PINGED · ~21% LISTEN-THROUGH RATE EXPECTED</span>
        </div>
      </div>
    );
  }

  function renderPublish() {
    const summary = [
      { k: 'TITLE', v: show.title },
      { k: 'STATION', v: `${show.station} · EP ${show.ep}` },
      { k: 'AIRS', v: show.schedule },
      { k: 'URL', v: `ihype.org/shows/${show.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'show'}-${show.ep}` },
      { k: 'SPLITS', v: '45% artists · 45% you · 10% referrers' },
      { k: 'REACH', v: `${reach} fans pinged` },
    ];
    const modes = [
      { id: 'promote', label: 'Publish + Promote', sub: 'Pin to your page · push to followers · surface to Discover', icon: '⚡' },
      { id: 'quiet',   label: 'Publish quietly',   sub: 'Live · indexed · no push notification', icon: '▶' },
      { id: 'schedule',label: 'Schedule + auto-promote', sub: 'Drops at your chosen slot · auto-push', icon: '📅' },
      { id: 'link',    label: 'Private link',       sub: 'Hidden · share manually with a few first', icon: '🔒' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EdHead title="Ready to drop?" sub="Final check. Pick how loud the launch should be. You can change this anytime after." xp={100} done={done.publish} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summary.map(r => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', borderRadius: 8, fontFamily: 'var(--f-b)', fontSize: 13 }}>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.08em', fontWeight: 600, color: 'var(--wb-ink-3)' }}>{r.k}</span>
              <span style={{ fontWeight: 600, color: 'var(--wb-ink)' }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {modes.map(m => {
            const on = show.publishMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => selectPublishMode(m.id)}
                style={{ padding: '10px 12px', borderRadius: 8, background: on ? 'rgba(255,62,154,.08)' : 'var(--wb-bg-3)', border: `1px solid ${on ? C.pink : 'var(--wb-line)'}`, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: on ? 'rgba(255,62,154,.2)' : 'var(--wb-bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--f-b)', fontSize: 12, fontWeight: 600, color: 'var(--wb-ink)', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--f-b)', fontSize: 11, color: 'var(--wb-ink-3)', lineHeight: 1.4 }}>{m.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const TABS: Array<{ k: Tab; label: string; xp: number }> = [
    { k: 'identity', label: 'IDENTITY', xp: 30 },
    { k: 'cover',    label: 'COVER',    xp: 15 },
    { k: 'splits',   label: 'SPLITS',   xp: 15 },
    { k: 'when',     label: 'WHEN',     xp: 20 },
    { k: 'who',      label: 'WHO',      xp: 20 },
    { k: 'publish',  label: 'PUBLISH',  xp: 100 },
  ];

  const progressItems: Array<{ tab: Tab; label: string; xp: number }> = [
    { tab: 'identity', label: 'Identity & tags',     xp: 30 },
    { tab: 'cover',    label: 'Cover art',            xp: 15 },
    { tab: 'splits',   label: 'Revenue splits',       xp: 15 },
    { tab: 'when',     label: 'Schedule · when it airs', xp: 20 },
    { tab: 'who',      label: 'Audience targeting',   xp: 20 },
  ];

  const stationDisplay = show.station.replace(/\s*FM\s*$/i, '').toUpperCase() + ' · FM';
  const scheduleDisplay = show.schedule.replace('·', '').replace(/\s+/g, ' ').trim().toUpperCase();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--wb-bg)', position: 'relative' }}>

      {/* XP pops */}
      {xpPops.map(p => (
        <div key={p.id} style={{ position: 'fixed', top: '50%', left: '50%', pointerEvents: 'none', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 22, letterSpacing: '-.01em', zIndex: 200, color: C.pink, textShadow: '0 4px 12px rgba(0,0,0,.5)', animation: 'rscFloatUp 1.4s ease-out forwards' }}>
          {p.text}
        </div>
      ))}

      {/* Quest bar */}
      <div style={{ flexShrink: 0, padding: '10px 20px', borderBottom: '1px solid var(--wb-line)', display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(90deg, rgba(255,62,154,.08) 0%, transparent 60%)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${C.pink}, ${C.accent})`, color: 'var(--wb-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>⚡</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 8, color: C.pink, letterSpacing: '.18em', fontWeight: 700 }}>CREATOR QUEST · RESETS IN 1D 6H</div>
          <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, letterSpacing: '-.005em', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Drop a new show this week · 2 of your followers are streaming yours every day</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 320, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--wb-ink)', fontWeight: 600, minWidth: 64 }}><b style={{ color: C.pink }}>{xpPct}</b>% READY</span>
          <div style={{ flex: 1, height: 7, background: 'var(--wb-bg-3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.pink}, ${C.accent})`, width: `${xpPct}%`, borderRadius: 99, boxShadow: '0 0 8px rgba(255,62,154,.4)', transition: 'width .5s' }} />
          </div>
          <div style={{ padding: '4px 9px', borderRadius: 99, background: 'rgba(255,62,154,.12)', color: C.pink, fontFamily: 'var(--f-m)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', border: '1px solid rgba(255,62,154,.3)', whiteSpace: 'nowrap' }}>
            + 200 XP · HOT DROP BADGE
          </div>
        </div>
      </div>

      {/* Arena */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 256px', gap: 0, minHeight: 0, overflow: 'hidden' }}>

        {/* Left: Stage/Cover */}
        <div style={{ padding: '16px 14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', borderRight: '1px solid var(--wb-line)' }}>
          {/* Cover art */}
          <div style={coverStyle}>
            {/* Sheen overlay */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 75% 25%, rgba(255,255,255,.28), transparent 50%), radial-gradient(circle at 20% 85%, rgba(0,0,0,.25), transparent 55%)' }} />
            <div style={{ position: 'absolute', top: 12, right: 12, width: 42, height: 42, borderRadius: '50%', background: 'rgba(0,0,0,.18)', border: '1.5px solid rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 11, color: 'var(--wb-bg)', zIndex: 3 }}>
              EP{show.ep}
            </div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.14em', fontWeight: 700, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: '#fff', display: 'block', animation: 'rscPulse 1.6s infinite' }} />
                LIVE PREVIEW
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, color: 'rgba(0,0,0,.5)', letterSpacing: '.18em', fontWeight: 700 }}>{stationDisplay}</div>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, color: 'rgba(0,0,0,.45)', letterSpacing: '.1em', fontWeight: 600, marginTop: 4 }}>EP {show.ep} · {show.schedule.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 22, color: 'var(--wb-bg)', letterSpacing: '-.02em', lineHeight: 1.05, marginTop: 4, wordBreak: 'break-word' }}>{show.title || 'Untitled'}</div>
            </div>
          </div>

          {/* Stats below cover */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { v: reach, l: 'REACH', c: C.pink },
              { v: String(show.tags.length), l: 'TAGS', c: 'var(--wb-ink)' },
              { v: scheduleDisplay.replace(/\s+/g, ' '), l: 'DROP TIME', c: C.amber },
            ].map(s => (
              <div key={s.l} style={{ padding: '8px 10px', background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', borderRadius: 8 }}>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 15, letterSpacing: '-.02em', lineHeight: 1, color: s.c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 7, color: 'var(--wb-ink-3)', letterSpacing: '.14em', fontWeight: 700, marginTop: 5 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Quick palette */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 10px', background: 'var(--wb-bg-3)', border: '1px solid var(--wb-line)', borderRadius: 99 }}>
            <span style={{ fontFamily: 'var(--f-m)', fontSize: 8, color: 'var(--wb-ink-3)', letterSpacing: '.14em', fontWeight: 700, marginRight: 'auto' }}>QUICK COVER</span>
            {COVER_PALETTES.slice(0, 5).map(([key, a, b]) => (
              <button
                key={key}
                onClick={() => selectCoverPalette(key)}
                aria-label={key}
                style={{ width: 20, height: 20, borderRadius: 99, background: `linear-gradient(135deg, ${a}, ${b})`, border: show.cover === key ? '2px solid var(--wb-ink)' : '2px solid transparent', cursor: 'pointer', transition: 'transform .12s' }}
              />
            ))}
          </div>
        </div>

        {/* Center: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px 16px 0' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 5, paddingBottom: 12, flexShrink: 0, flexWrap: 'wrap' }}>
            {TABS.map(t => {
              const isOn  = tab === t.k;
              const isDone = done[t.k];
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: isOn ? 'rgba(255,62,154,.1)' : 'var(--wb-bg-2)', border: `1px solid ${isOn ? C.pink : 'var(--wb-line)'}`, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', justifyContent: 'center', transition: 'all .15s', minWidth: 0 }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: 99, background: isDone ? C.teal : isOn ? C.pink : 'var(--wb-bg-3)', color: isDone || isOn ? 'var(--wb-bg)' : 'var(--wb-ink-3)', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                    {t.k === 'publish' ? '★' : TABS.findIndex(x => x.k === t.k) + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.06em', color: isOn ? 'var(--wb-ink)' : 'var(--wb-ink-2)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Editor card */}
          <div style={{ flex: 1, background: 'var(--wb-bg-2)', border: '1px solid var(--wb-line)', borderRadius: 14, padding: '18px 20px', overflowY: 'auto', minHeight: 0 }}>
            {tab === 'identity' && renderIdentity()}
            {tab === 'cover'    && renderCover()}
            {tab === 'splits'   && renderSplits()}
            {tab === 'when'     && renderWhen()}
            {tab === 'who'      && renderWho()}
            {tab === 'publish'  && renderPublish()}
          </div>
        </div>

        {/* Right: Creator rail */}
        <div style={{ borderLeft: '1px solid var(--wb-line)', overflowY: 'auto', padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Progress */}
          <div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, letterSpacing: '-.005em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              This show
              <span style={{ padding: '1px 7px', borderRadius: 99, background: 'rgba(34,229,212,.12)', color: C.teal, fontFamily: 'var(--f-m)', fontSize: 8, fontWeight: 700, letterSpacing: '.1em' }}>{doneCount} / 5</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {progressItems.map(p => {
                const isDone = done[p.tab];
                const isOn   = tab === p.tab && !isDone;
                return (
                  <button
                    key={p.tab}
                    onClick={() => setTab(p.tab)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 7, background: isDone ? 'rgba(34,229,212,.06)' : isOn ? 'rgba(255,62,154,.08)' : 'var(--wb-bg-3)', border: `1px solid ${isDone ? 'rgba(34,229,212,.3)' : isOn ? C.pink : 'var(--wb-line)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: 99, border: `1.5px solid ${isDone ? C.teal : isOn ? C.pink : 'var(--wb-ink-3)'}`, background: isDone ? C.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--wb-bg)', fontSize: 9 }}>
                      {isDone && '✓'}
                    </div>
                    <span style={{ fontFamily: 'var(--f-b)', fontSize: 11, fontWeight: 500, flex: 1, color: 'var(--wb-ink)' }}>{p.label}</span>
                    <span style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.08em', fontWeight: 600, color: isDone ? C.teal : isOn ? C.pink : 'var(--wb-ink-3)' }}>+{p.xp} XP</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              Top creators
              <span style={{ padding: '1px 7px', borderRadius: 99, background: 'rgba(255,184,74,.12)', color: C.amber, fontFamily: 'var(--f-m)', fontSize: 8, fontWeight: 700, letterSpacing: '.1em' }}>RESET FRI</span>
            </div>
            {[
              { rank: '01', init: 'NK', color: C.pink, name: 'Nikki K.', sub: 'resident · 18 shows', pts: '8,420', top: true, me: false },
              { rank: '02', init: 'DJ', color: C.teal,  name: 'DJ Halflight', sub: 'resident · 12 shows', pts: '7,180', top: false, me: false },
              { rank: '03', init: 'MR', color: C.pink,  name: 'You', sub: '+ 2 spots since last week', pts: '6,420', top: false, me: true },
              { rank: '04', init: 'SR', color: C.purple,name: 'Sade R.', sub: 'guest · 4 shows', pts: '5,920', top: false, me: false },
              { rank: '05', init: 'CV', color: C.amber, name: 'Cobalt Vela', sub: 'resident · 9 shows', pts: '5,460', top: false, me: false },
            ].map(r => (
              <div key={r.rank} style={{ display: 'grid', gridTemplateColumns: '16px 24px 1fr auto', gap: 8, alignItems: 'center', padding: '6px 4px', borderBottom: r.me ? 'none' : '1px solid var(--wb-line)', background: r.me ? 'rgba(255,62,154,.06)' : 'transparent', borderRadius: r.me ? 7 : 0, marginBottom: r.me ? 2 : 0 }}>
                <span style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 12, color: r.top ? C.amber : r.me ? C.pink : 'var(--wb-ink-3)', textAlign: 'center' }}>{r.rank}</span>
                <div style={{ width: 22, height: 22, borderRadius: 99, background: `linear-gradient(135deg, ${r.color}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 9, color: 'var(--wb-bg)' }}>{r.init}</div>
                <div>
                  <div style={{ fontFamily: 'var(--f-b)', fontSize: 11, fontWeight: 500, color: 'var(--wb-ink)' }}>{r.name}</div>
                  <div style={{ fontFamily: 'var(--f-m)', fontSize: 8, color: 'var(--wb-ink-3)', marginTop: 1, letterSpacing: '.04em' }}>{r.sub}</div>
                </div>
                <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: C.pink, fontWeight: 700, letterSpacing: '.04em' }}>{r.pts}</span>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              Achievements
              <span style={{ padding: '1px 7px', borderRadius: 99, background: 'rgba(255,62,154,.12)', color: C.pink, fontFamily: 'var(--f-m)', fontSize: 8, fontWeight: 700, letterSpacing: '.1em' }}>9 / 24</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {[
                { label: 'FIRST DROP', got: true, icon: '○' },
                { label: '10 SHOWS',   got: true, icon: '⚡' },
                { label: '100 PLAYS',  got: true, icon: '↗' },
                { label: 'GOT HYPED',  got: true, icon: '♥' },
                { label: '7-WEEK FIRE',got: true, icon: '🔥' },
                { label: 'DUET',       got: true, icon: '⚯' },
                { label: '1K PLAYS',   got: false, icon: '🔒' },
                { label: 'TASTEMAKER', got: false, icon: '🔒' },
                { label: 'VIRAL DROP', got: false, icon: '🔒' },
              ].map(a => (
                <div key={a.label} style={{ aspectRatio: '1', borderRadius: 10, background: a.got ? 'rgba(255,62,154,.06)' : 'var(--wb-bg-3)', border: `1px solid ${a.got ? 'rgba(255,62,154,.3)' : 'var(--wb-line)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: 5, opacity: a.got ? 1 : 0.4 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</span>
                  <span style={{ fontFamily: 'var(--f-m)', fontSize: 7, color: a.got ? 'var(--wb-ink)' : 'var(--wb-ink-2)', letterSpacing: '.06em', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, marginBottom: 9 }}>What creators are doing</div>
            {[
              { init: 'NK', color: C.pink,   who: 'Nikki K.',     action: 'dropped EP 19',       when: '2m' },
              { init: 'DJ', color: C.teal,   who: 'DJ Halflight',  action: '+ 50 listeners',      when: '7m' },
              { init: 'CV', color: C.amber,  who: 'Cobalt Vela',   action: 'hit 5k plays',        when: '14m' },
              { init: 'SR', color: C.purple, who: 'Sade R.',       action: 'scheduled Sat 9pm',   when: '22m' },
            ].map(f => (
              <div key={f.who} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 3px', fontFamily: 'var(--f-b)', fontSize: 10, color: 'var(--wb-ink-2)' }}>
                <div style={{ width: 16, height: 16, borderRadius: 99, background: f.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 7, color: 'var(--wb-bg)' }}>{f.init}</div>
                <span><b style={{ color: 'var(--wb-ink)', fontWeight: 600 }}>{f.who}</b> {f.action}</span>
                <span style={{ fontFamily: 'var(--f-m)', fontSize: 8, color: 'var(--wb-ink-3)', letterSpacing: '.04em', marginLeft: 'auto', flexShrink: 0 }}>{f.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* XP / Readiness bar */}
      <div style={{ flexShrink: 0, padding: '11px 18px 13px', borderTop: '1px solid var(--wb-line)', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14, alignItems: 'center', background: 'var(--wb-bg-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${C.pink}, ${C.accent})`, color: 'var(--wb-bg)', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-.02em', boxShadow: '0 4px 12px rgba(255,62,154,.3)', flexShrink: 0 }}>
            {xpPct}<span style={{ fontSize: 7, opacity: 0.7 }}>%</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 8, color: 'var(--wb-ink-3)', letterSpacing: '.16em', fontWeight: 700 }}>SHOW READINESS</div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, letterSpacing: '-.005em' }}>
              Next: <span style={{ color: C.amber }}>HOT DROP</span> badge
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 9, background: 'var(--wb-bg-3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.pink}, ${C.accent}, ${C.amber})`, width: `${xpPct}%`, borderRadius: 99, boxShadow: '0 0 10px rgba(255,62,154,.4)', transition: 'width .6s cubic-bezier(.2,.7,.2,1)' }} />
          </div>
          <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--wb-ink)', letterSpacing: '.04em', fontWeight: 600, minWidth: 88, textAlign: 'right' }}><b style={{ color: C.pink }}>{xp}</b> / {TOTAL_XP} XP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 99, background: 'rgba(255,184,74,.1)', border: '1px solid rgba(255,184,74,.3)' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>🔥</span>
          <span style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 16, color: C.amber, letterSpacing: '-.01em' }}>7</span>
          <span style={{ fontFamily: 'var(--f-m)', fontSize: 8, color: 'var(--wb-ink-2)', letterSpacing: '.14em', fontWeight: 700 }}>WEEK STREAK</span>
        </div>
        <button
          disabled={xpPct < 100}
          onClick={() => xpPct >= 100 && setLevelUp(true)}
          style={{ padding: '9px 18px', background: xpPct >= 100 ? C.pink : 'var(--wb-bg-3)', color: xpPct >= 100 ? 'var(--wb-bg)' : 'var(--wb-ink-3)', borderRadius: 99, fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: xpPct >= 100 ? '0 6px 20px rgba(255,62,154,.35)' : 'none', border: xpPct >= 100 ? 'none' : '1px solid var(--wb-line-2)', cursor: xpPct >= 100 ? 'pointer' : 'not-allowed', transition: 'all .15s', whiteSpace: 'nowrap' }}
        >
          {xpPct >= 100 ? '⚡ OPEN THE BUILDER →' : `🔒 OPEN BUILDER · ${100 - xpPct}% LEFT`}
        </button>
      </div>

      {/* Level-up / completion overlay */}
      {levelUp && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(10px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 460 }}>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: C.pink, letterSpacing: '.4em', fontWeight: 700, marginBottom: 8 }}>SHOW READY</div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 120, letterSpacing: '-.04em', lineHeight: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.accent}, ${C.amber})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 24px rgba(255,62,154,.5))' }}>
              100%
            </div>
            <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', marginTop: 10, color: 'var(--wb-ink)' }}>HOT DROP UNLOCKED</div>
            <div style={{ fontFamily: 'var(--f-s)', fontStyle: 'italic', fontSize: 15, color: 'var(--wb-ink-2)', marginTop: 10, lineHeight: 1.45, padding: '0 20px' }}>
              All five sections done. You earned the Hot Drop badge and your show gets a <strong>1.5× promotion boost</strong> when it airs.
            </div>
            <button
              onClick={() => setLevelUp(false)}
              style={{ marginTop: 22, padding: '13px 30px', background: C.pink, color: 'var(--wb-bg)', borderRadius: 99, fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', cursor: 'pointer', border: 'none' }}
            >
              CONTINUE →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rscPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes rscFloatUp { 0%{transform:translate(-50%,0) scale(.5);opacity:0} 20%{opacity:1;transform:translate(-50%,-10px) scale(1.2)} 100%{transform:translate(-50%,-100px) scale(.9);opacity:0} }
      `}</style>
    </div>
  );
});

// ── Helper sub-components ──────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--wb-bg-3)',
  border: '1px solid var(--wb-line)',
  borderRadius: 8,
  padding: '9px 12px',
  color: 'var(--wb-ink)',
  fontFamily: 'var(--f-b)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.16em', color: 'var(--wb-ink-3)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {label}
        {hint && <span style={{ fontFamily: 'var(--f-b)', fontSize: 10, color: 'var(--wb-ink-3)', letterSpacing: 0, textTransform: 'none', fontWeight: 500, fontStyle: 'italic' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function EdHead({ title, sub, xp, done }: { title: string; sub: string; xp: number; done: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', margin: 0 }}>{title}</h2>
        <div style={{ fontFamily: 'var(--f-s)', fontStyle: 'italic', fontSize: 12, color: 'var(--wb-ink-2)', marginTop: 3, lineHeight: 1.4, maxWidth: 360 }}>{sub}</div>
      </div>
      <div style={{ padding: '4px 9px', borderRadius: 99, background: 'rgba(255,184,74,.1)', border: '1px solid rgba(255,184,74,.3)', color: '#ffb84a', fontFamily: 'var(--f-m)', fontSize: 9, fontWeight: 700, letterSpacing: '.12em', whiteSpace: 'nowrap' }}>
        +{xp} XP{done ? ' · DONE' : ''}
      </div>
    </div>
  );
}
