'use client';

import { useState, type ReactNode } from 'react';

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'lineup', label: 'Lineup' },
  { id: 'venue', label: 'Venue' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function ShowTabs({
  children,
  lineupTab,
  venueTab,
}: {
  children: ReactNode;
  lineupTab: ReactNode;
  venueTab: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>('about');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 14, padding: '9px 18px', borderRadius: 9999, cursor: 'pointer',
              background: tab === t.id ? 'rgba(255,80,41,.1)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${tab === t.id ? 'rgba(255,80,41,.35)' : 'rgba(255,255,255,.08)'}`,
              color: tab === t.id ? 'var(--ink)' : 'rgba(240,235,229,.55)', fontWeight: tab === t.id ? 500 : 400,
            }}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, display: tab === 'about' ? 'block' : 'none' }}>{children}</div>
      <div style={{ marginTop: 24, display: tab === 'lineup' ? 'block' : 'none' }}>{lineupTab}</div>
      <div style={{ marginTop: 24, display: tab === 'venue' ? 'block' : 'none' }}>{venueTab}</div>
    </div>
  );
}
