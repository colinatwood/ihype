'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { WorkbenchData } from '@/types/workbench';
import { DEFAULT_PREFS } from './types';
import type { View } from './types';
import { ViewSettings } from './ViewSettings';
import { ViewArtistPage } from './ViewArtistPage';
import { ViewVenuePage } from './ViewVenuePage';

const ViewPageStudio = dynamic(() => import('./ViewPageStudio'), {
  loading: () => (
    <div style={{ height: 240, background: 'linear-gradient(90deg, var(--bg-2) 25%, var(--bg-3) 50%, var(--bg-2) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
  ),
});

type PageRole = 'ARTIST' | 'VENUE' | 'DJ' | 'LISTENER';
type PageView = 'home' | 'editor' | 'preview';

const PAGE_LABELS: Record<PageRole, string> = {
  ARTIST: 'Artist Page',
  VENUE: 'Venue Page',
  DJ: 'DJ Page',
  LISTENER: 'Fan Profile',
};

const STUDIO_ROLES: Record<PageRole, 'artist' | 'venue' | 'dj' | 'fan'> = {
  ARTIST: 'artist', VENUE: 'venue', DJ: 'dj', LISTENER: 'fan',
};

const PAGE_ORDER: PageRole[] = ['ARTIST', 'VENUE', 'DJ', 'LISTENER'];

function derivePages(data: WorkbenchData): PageRole[] {
  const types = data.activeProfileTypes ?? [];
  const ordered = PAGE_ORDER.filter(r => types.includes(r));
  if (ordered.length === 0 && data.profileType) {
    const t = (data.profileType as string).toUpperCase() as PageRole;
    if (PAGE_LABELS[t]) return [t];
  }
  return ordered.length > 0 ? ordered : ['LISTENER'];
}

// ── Subheader page tabs ──────────────────────────────────────────

type SubTab = PageRole | 'SETTINGS';

function PageSubHeader({
  pages, selected, onSelect,
}: {
  pages: PageRole[];
  selected: SubTab;
  onSelect: (t: SubTab) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px 0', flexShrink: 0, flexWrap: 'wrap' }}>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          style={{
            padding: '7px 16px', borderRadius: 99, cursor: 'pointer',
            fontFamily: 'var(--f-b)', fontWeight: 600, fontSize: 13,
            border: p === selected ? '1px solid rgba(185,131,255,.4)' : '1px solid var(--line-2)',
            background: p === selected ? 'rgba(185,131,255,.12)' : 'transparent',
            color: p === selected ? 'var(--ink)' : 'var(--ink-2)',
            transition: 'background .14s, color .14s',
          }}
        >
          {PAGE_LABELS[p]}
        </button>
      ))}
      <button
        onClick={() => onSelect('SETTINGS')}
        style={{
          marginLeft: 'auto', padding: '7px 13px', borderRadius: 99, cursor: 'pointer',
          fontFamily: 'var(--f-b)', fontWeight: 600, fontSize: 12,
          border: selected === 'SETTINGS' ? '1px solid rgba(185,131,255,.4)' : '1px solid var(--line-2)',
          background: selected === 'SETTINGS' ? 'rgba(185,131,255,.12)' : 'transparent',
          color: selected === 'SETTINGS' ? 'var(--ink)' : 'var(--ink-3)',
        }}
      >
        ⚙ Settings
      </button>
    </div>
  );
}

// ── Action card grid ─────────────────────────────────────────────

function ActionCard({
  icon, label, sub, accent, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  accent?: string;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        padding: '18px 18px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
        border: `1px solid ${hov ? 'rgba(185,131,255,.25)' : 'rgba(255,255,255,.07)'}`,
        background: hov ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
        transition: 'background .14s, border-color .14s',
        minHeight: 110,
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: accent ? `${accent}18` : 'rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent ?? 'var(--ink-2)', fontSize: 16,
      }}>
        {icon}
      </span>
      <div>
        <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 3 }}>{label}</div>
        <div style={{ fontFamily: 'var(--f-b)', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.3 }}>{sub}</div>
      </div>
    </button>
  );
}

// ── Stat pill ────────────────────────────────────────────────────

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
      <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Page dashboard ───────────────────────────────────────────────

function PageDashboard({
  data,
  role,
  pageView,
  setPageView,
  onNavigate,
}: {
  data: WorkbenchData;
  role: PageRole;
  pageView: PageView;
  setPageView: (v: PageView) => void;
  onNavigate?: (v: View) => void;
}) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'done'>('idle');
  const isCreator = role === 'ARTIST' || role === 'VENUE' || role === 'DJ';
  const studioRole = STUDIO_ROLES[role];

  const handleShareInvite = useCallback(async () => {
    if (!data.profileHexId) return;
    const url = new URL(`/invite/${data.profileHexId}`, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join me on iHYPE', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt('Copy your invite link', url);
      }
      setShareStatus('done');
      window.setTimeout(() => setShareStatus('idle'), 1800);
    } catch { /* ignored */ }
  }, [data.profileHexId]);

  if (pageView === 'editor') {
    return (
      <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 22px', flexShrink: 0 }}>
          <button
            onClick={() => setPageView('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-b)', fontSize: 12, color: 'var(--ink-3)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Back to {PAGE_LABELS[role]}
          </button>
        </div>
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <ViewPageStudio data={data} defaultRole={studioRole} />
        </div>
      </div>
    );
  }

  if (pageView === 'preview') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '8px 22px 0' }}>
          <button
            onClick={() => setPageView('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-b)', fontSize: 12, color: 'var(--ink-3)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Back to {PAGE_LABELS[role]}
          </button>
        </div>
        {role === 'ARTIST' && <ViewArtistPage data={data} />}
        {role === 'VENUE' && <ViewVenuePage data={data} />}
        {(role === 'DJ' || role === 'LISTENER') && (
          <div style={{ padding: '0 32px 32px' }}>
            <ViewPageStudio data={data} defaultRole={studioRole} />
          </div>
        )}
      </div>
    );
  }

  // home dashboard
  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 22px 32px' }}>
      {/* Page identity card */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(185,131,255,.1), rgba(255,80,41,.06))',
        border: '1px solid rgba(185,131,255,.2)',
      }}>
        <div style={{ padding: '20px 22px 18px' }}>
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 5 }}>
            {PAGE_LABELS[role]}
          </div>
          <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 22, color: 'var(--ink)', lineHeight: 1, marginBottom: 14 }}>
            {data.userName ?? 'Your Page'}
          </div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(data.hypeCount ?? 0) > 0 && <StatPill value={(data.hypeCount ?? 0).toLocaleString()} label="Hype" />}
            {(data.followerCount ?? 0) > 0 && <StatPill value={(data.followerCount ?? 0).toLocaleString()} label="Followers" />}
          </div>
        </div>
        {/* Quick action bar */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,.07)' }}>
          {data.profilePath && data.hasPublishedPage && (
            <a
              href={data.profilePath}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, padding: '13px 0', textAlign: 'center', cursor: 'pointer',
                fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
                color: '#ff5029', textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,.07)',
              }}
            >
              VIEW ↗
            </a>
          )}
          <button
            onClick={() => setPageView('editor')}
            style={{
              flex: 1, padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--ink-2)',
              borderRight: data.profilePath && data.hasPublishedPage ? '1px solid rgba(255,255,255,.07)' : 'none',
            }}
          >
            EDIT PAGE
          </button>
          {data.profilePath && data.hasPublishedPage && (
            <button
              onClick={() => setPageView('preview')}
              style={{
                flex: 1, padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-m)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(185,131,255,.9)',
              }}
            >
              PREVIEW
            </button>
          )}
        </div>
      </div>

      {/* Action cards grid */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12 }}>
          Page Tools
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          <ActionCard
            label="Edit My Page"
            sub="Customize design & content"
            accent="rgba(185,131,255,1)"
            onClick={() => setPageView('editor')}
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width={18} height={18}><path d="M14.5 3.5l2 2L6 16H4v-2L14.5 3.5Z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          {isCreator && (
            <ActionCard
              label="Tour Builder"
              sub="Plan dates & routes"
              accent="#22e5d4"
              onClick={() => onNavigate?.('tour')}
              icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width={18} height={18}><circle cx="5" cy="15" r="2"/><circle cx="15" cy="5" r="2"/><path d="M7 13.5C8.5 11 12 9 13.5 6.5" strokeLinecap="round"/><path d="M3 4h4M4 3v4" strokeLinecap="round"/><path d="M13 16h4M15 14v4" strokeLinecap="round"/></svg>}
            />
          )}
          {isCreator && (
            <ActionCard
              label="Show Creator"
              sub="Submit & manage events"
              accent="#ff5029"
              onClick={() => onNavigate?.('events')}
              icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width={18} height={18}><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M6 2v3M14 2v3M2 9h16" strokeLinecap="round"/></svg>}
            />
          )}
          {isCreator && (
            <ActionCard
              label="Ad Recommendations"
              sub="Boost your presence"
              accent="#ffd700"
              onClick={() => { /* future */ }}
              icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width={18} height={18}><path d="M3 14V8a1 1 0 0 1 1-1h3l3-4 3 4h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v2M10 8h.01" strokeLinecap="round"/></svg>}
            />
          )}
          {!isCreator && !!data.profileHexId && (
            <ActionCard
              label="Share My Link"
              sub={shareStatus === 'done' ? 'Link copied!' : 'Earn points for sign-ups'}
              accent={shareStatus === 'done' ? '#22e5d4' : 'rgba(185,131,255,1)'}
              onClick={() => { void handleShareInvite(); }}
              icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width={18} height={18}><path d="M8 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM13.5 6.5l1.5-1.5M13.5 13.5l1.5 1.5M6.5 6.5 5 5M6.5 13.5 5 15" strokeLinecap="round"/><circle cx="16" cy="4" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="4" cy="4" r="1.5"/><circle cx="4" cy="16" r="1.5"/></svg>}
            />
          )}
          <ActionCard
            label={data.hasPublishedPage ? 'Page Preview' : 'Preview Draft'}
            sub="See how others see you"
            onClick={() => setPageView('preview')}
            icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" width={18} height={18}><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z"/><circle cx="10" cy="10" r="2.5"/></svg>}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main hub ─────────────────────────────────────────────────────

export function ViewPagesHub({
  data,
  prefs,
  setPref,
  onBack,
  onNavigateTo,
}: {
  data: WorkbenchData;
  prefs: typeof DEFAULT_PREFS;
  setPref: (k: string, v: unknown) => void;
  onBack?: () => void;
  onNavigateTo?: (v: View) => void;
}) {
  const pages = derivePages(data);
  const [selectedTab, setSelectedTab] = useState<SubTab>(pages[0] ?? 'LISTENER');
  const [pageView, setPageView] = useState<PageView>('home');

  const handleTabChange = (t: SubTab) => {
    setSelectedTab(t);
    setPageView('home');
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top header */}
      <div style={{ padding: '18px 22px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontFamily: 'var(--f-m)', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 700, marginBottom: 4 }}>
          Your Presence
        </div>
        <h1 style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 28, letterSpacing: '-.025em', margin: 0, lineHeight: 1 }}>
          Pages
        </h1>
      </div>

      {/* Page subheader tabs */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <PageSubHeader pages={pages} selected={selectedTab} onSelect={handleTabChange} />
        <div style={{ height: 10 }} />
      </div>

      {/* Content area */}
      {selectedTab === 'SETTINGS' ? (
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <ViewSettings prefs={prefs} setPref={setPref} data={data} onBack={onBack} />
        </div>
      ) : (
        <PageDashboard
          data={data}
          role={selectedTab as PageRole}
          pageView={pageView}
          setPageView={setPageView}
          onNavigate={onNavigateTo}
        />
      )}
    </div>
  );
}
