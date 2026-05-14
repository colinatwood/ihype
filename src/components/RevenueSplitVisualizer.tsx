'use client';

import React from 'react';

export type RevenueSplitTrack = {
  id: string;
  artistName: string;
  trackTitle: string;
  color: string;
};

export type RevenueSplitProjection = {
  totalDollars: number;
  windowLabel: string;
  listens: number;
};

type Props = {
  tracks: RevenueSplitTrack[];
  hostName: string;
  referrerLabel: string;
  onReferrerLabelChange: (label: string) => void;
  mode: 'co-host' | 'referrer';
  onModeChange: (mode: 'co-host' | 'referrer') => void;
  projection: RevenueSplitProjection | null;
  onSchedule: () => void;
};

const SPLITS = {
  artist: 45,
  host: 45,
  referrer: 10,
};

function Bar({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.16em', color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .4s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

export function RevenueSplitVisualizer({ tracks, hostName, referrerLabel, onReferrerLabelChange, mode, onModeChange, projection, onSchedule }: Props) {
  const perArtistPct = tracks.length > 0 ? SPLITS.artist / tracks.length : 0;
  const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const projArtist = projection ? fmt(projection.totalDollars * SPLITS.artist / 100 / Math.max(1, tracks.length)) : null;
  const projHost = projection ? fmt(projection.totalDollars * SPLITS.host / 100) : null;
  const projReferrer = projection ? fmt(projection.totalDollars * SPLITS.referrer / 100) : null;

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-2)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Revenue split</div>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.06em', marginTop: 2 }}>
            ARTIST SHARE · 45% &nbsp;·&nbsp; HOST SHARE · 45% &nbsp;·&nbsp; REFERRER · 10%
          </div>
        </div>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 7 }}>
          {(['referrer', 'co-host'] as const).map(m => (
            <button key={m} type="button" onClick={() => onModeChange(m)}
              style={{ padding: '6px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.04em', background: mode === m ? 'var(--bg)' : 'transparent', color: mode === m ? 'var(--ink)' : 'var(--ink-3)', transition: 'background .15s, color .15s' }}>
              {m === 'referrer' ? 'Referrer' : 'Co-host'}
            </button>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
          <Bar
            pct={SPLITS.artist}
            color="#ff3e9a"
            label={`Artists (${tracks.length || 1})`}
            value={tracks.length > 0 ? `${perArtistPct.toFixed(1)}% ea` : `${SPLITS.artist}%`}
          />
          <Bar
            pct={SPLITS.host}
            color="#22e5d4"
            label={`Host · ${hostName}`}
            value={`${SPLITS.host}%`}
          />
          <Bar
            pct={SPLITS.referrer}
            color="#ffb84a"
            label={mode === 'co-host' ? 'Co-host' : 'Referrer'}
            value={`${SPLITS.referrer}%`}
          />
        </div>

        {/* Artist breakdown */}
        {tracks.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tracks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: `1px solid ${t.color}30`, borderRadius: 99, background: `${t.color}10` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-2)' }}>{t.artistName}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)' }}>{perArtistPct.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referrer label input */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.1em', color: 'var(--ink-3)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          {mode === 'co-host' ? 'Co-host label' : 'Referrer label'}
        </div>
        <input
          value={referrerLabel}
          onChange={e => onReferrerLabelChange(e.target.value)}
          placeholder="Anyone who shares your show"
          style={{ flex: 1, padding: '7px 10px', background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 6, fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink)', outline: 'none' }}
        />
      </div>

      {/* Projection card */}
      {projection && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'rgba(255,184,74,.04)' }}>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.16em', color: '#ffb84a', marginBottom: 10 }}>
            PROJECTED · {projection.windowLabel.toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { l: 'Total', v: fmt(projection.totalDollars), c: 'var(--ink)' },
              { l: `Per artist${tracks.length > 1 ? ` (×${tracks.length})` : ''}`, v: projArtist ?? '—', c: '#ff3e9a' },
              { l: 'Host',     v: projHost ?? '—', c: '#22e5d4' },
              { l: 'Referrer', v: projReferrer ?? '—', c: '#ffb84a' },
              { l: 'Listens',  v: projection.listens.toLocaleString(), c: 'var(--ink-2)' },
            ].map(({ l, v, c }) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.14em', color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 16, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule button */}
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onSchedule}
          style={{ padding: '10px 22px', background: 'var(--ink)', color: 'var(--bg)', border: 'none', borderRadius: 7, fontFamily: 'var(--f-m)', fontSize: 12, fontWeight: 600, letterSpacing: '.04em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          Schedule &amp; publish →
        </button>
      </div>
    </div>
  );
}
