'use client';

import React, { useState, useEffect } from 'react';

type SeedTrack = {
  id: string;
  title: string;
  artistName: string;
  color: string;
  album?: string;
  duration?: string;
  hypeCount?: number;
  city?: string;
  profileSlug?: string;
};

export function ViewSaved() {
  const [tracks, setTracks] = useState<SeedTrack[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ihype-saved-tracks') ?? '[]');
      setTracks(stored);
    } catch {
      setTracks([]);
    }
  }, []);

  function removeTrack(id: string) {
    const next = tracks.filter(t => t.id !== id);
    setTracks(next);
    try { localStorage.setItem('ihype-saved-tracks', JSON.stringify(next)); } catch {}
  }

  function clearAll() {
    setTracks([]);
    try { localStorage.removeItem('ihype-saved-tracks'); } catch {}
  }

  async function shareTrack(track: SeedTrack) {
    const url = track.profileSlug
      ? `${window.location.origin}/artists/${track.profileSlug}`
      : window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: track.title, text: `${track.title} by ${track.artistName} on iHYPE`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <div style={{ padding: '32px 48px 48px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.18em', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>
            SAVED TRACKS
          </div>
          <h1 style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 38, letterSpacing: '-.025em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
            Your Queue
          </h1>
        </div>
        {tracks.length > 0 && (
          <button
            onClick={clearAll}
            style={{ background: 'none', border: '1px solid var(--line-2)', borderRadius: 8, cursor: 'pointer', color: 'var(--ink-3)', fontFamily: 'var(--f-m)', fontSize: 12, padding: '7px 14px', letterSpacing: '.06em' }}
          >
            Clear all
          </button>
        )}
      </div>

      {tracks.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 22, color: 'var(--ink)' }}>No saved tracks yet</div>
          <div style={{ fontFamily: 'var(--f-b)', fontSize: 14, color: 'var(--ink-2)', maxWidth: '32ch', lineHeight: 1.5 }}>
            Save seeds to build your queue — swipe up or click Save in the Seeds view.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tracks.map((track, i) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: track.color || 'var(--accent)', flexShrink: 0 }} />
              <div style={{ width: 40, fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{track.artistName}{track.city ? ` · ${track.city}` : ''}</div>
              </div>
              {track.hypeCount != null && (
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', flexShrink: 0 }}>
                  ♥ {track.hypeCount.toLocaleString()}
                </div>
              )}
              <button
                onClick={() => void shareTrack(track)}
                style={{ background: 'none', border: '1px solid var(--line-2)', borderRadius: 6, cursor: 'pointer', color: 'var(--ink-3)', fontFamily: 'var(--f-m)', fontSize: 11, padding: '4px 10px', letterSpacing: '.06em', flexShrink: 0 }}
              >
                ↗ Share
              </button>
              <button
                onClick={() => removeTrack(track.id)}
                style={{ background: 'none', border: '1px solid rgba(255,60,60,.25)', borderRadius: 6, cursor: 'pointer', color: 'rgba(255,107,90,.7)', fontFamily: 'var(--f-m)', fontSize: 11, padding: '4px 10px', letterSpacing: '.06em', flexShrink: 0 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
