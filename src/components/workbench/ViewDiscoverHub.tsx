'use client';

import React from 'react';
import type { WorkbenchData } from '@/types/workbench';
import { ViewSeeds } from './ViewSeeds';

export function ViewDiscoverHub({
  data,
  seedPlaying,
  setSeedPlaying,
  onSeedSave,
  onPickTrack,
}: {
  data: WorkbenchData;
  seedPlaying: boolean;
  setSeedPlaying: (p: boolean) => void;
  onSeedSave: (idx: number) => void;
  onPickTrack: (i: number) => void;
}) {
  void onPickTrack; // not needed for Seeds-only view but kept in props for compatibility

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 700, marginBottom: 6 }}>Rising near you</div>
        <h1 style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 28, letterSpacing: '-.025em', margin: 0, lineHeight: 1 }}>Plant a hype. Grow a scene.</h1>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ViewSeeds data={data} seedPlaying={seedPlaying} setSeedPlaying={setSeedPlaying} onSave={onSeedSave} />
      </div>
    </div>
  );
}
