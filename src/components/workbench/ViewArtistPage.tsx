'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorkbenchData } from '@/types/workbench';
import { ArtistMediaUploadManager } from '@/components/ArtistMediaUploadManager';
import ViewPageStudio from './ViewPageStudio';
import { getProfilePathForType } from '@/lib/profile-paths';

/* ── types ───────────────────────────────────────────────── */
type CkMode = 'page' | 'insights' | 'tour' | 'release' | 'library' | 'presskit';

/* ── sub-components ──────────────────────────────────────── */
function RailBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(255,80,41,.12)' : 'transparent',
        color: active ? '#ff5029' : 'rgba(244,239,233,.45)',
        transition: 'all .15s', width: '100%',
      }}
    >
      <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
    </button>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  padding: '9px 12px',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 8,
  color: 'var(--ink,#f4efe9)',
  fontFamily: 'var(--f-b,sans-serif)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

/* ── main component ──────────────────────────────────────── */
export function ViewArtistPage({ data }: { data: WorkbenchData }) {
  const [mode, setMode] = useState<CkMode>('page');
  const [isMobile, setIsMobile] = useState(false);

  // Release Planner — track selection
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    data.tracks && data.tracks.length > 0 ? data.tracks[0].id : null
  );
  const selectedTrack = data.tracks?.find(t => t.id === selectedTrackId) ?? data.tracks?.[0] ?? null;

  // Insights — live data
  const [insightsData, setInsightsData] = useState<{ listens30d: number; finishRate: number; topTracks: Array<{title: string; listens: number}>; dailyListens?: number[] } | null>(null);
  const [insightsFetched, setInsightsFetched] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (mode !== 'insights' || insightsFetched) return;
    setInsightsFetched(true);
    fetch('/api/insights/me')
      .then(r => r.ok ? r.json() : null)
      .then((d: { listens30d?: number; finishRate?: number; topTracks?: Array<{title: string; listens: number}> } | null) => {
        if (d) setInsightsData({
          listens30d: d.listens30d ?? 0,
          finishRate: d.finishRate ?? 0,
          topTracks: d.topTracks ?? [],
          dailyListens: (d as { dailyListens?: number[] }).dailyListens,
        });
      })
      .catch(() => {});
  }, [mode, insightsFetched]);

  const profilePath = data.pageEditor?.slug
    ? getProfilePathForType(data.pageEditor.type, data.pageEditor.slug)
    : '';
  const artistSlug = profilePath ? `ihype.org${profilePath}` : 'ihype.org';
  const artistName = data.userName || 'Maya Reyes';
  const initials = artistName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const ARTIST_TABS: { k: CkMode; label: string; icon: React.ReactNode }[] = [
    { k: 'page',      label: 'Page',     icon: <IconPage /> },
    { k: 'insights',  label: 'Insights', icon: <IconInsights /> },
    { k: 'tour',      label: 'Tour',     icon: <IconTour /> },
    { k: 'release',   label: 'Release',  icon: <IconRelease /> },
    { k: 'library',   label: 'Library',  icon: <IconLibrary /> },
    { k: 'presskit',  label: 'Press Kit',icon: <IconPressKit /> },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '200px 1fr', background: 'var(--bg,#0c0a09)', overflow: 'hidden' }}>
      {/* ── left rail (desktop) ── */}
      <div style={{
        display: isMobile ? 'none' : 'flex', flexDirection: 'column',
        background: 'var(--bg-2,#121009)', borderRight: '1px solid var(--line-2,rgba(255,255,255,.07))',
        overflow: 'hidden',
      }}>
        {/* identity */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--line-2,rgba(255,255,255,.07))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#ff5029,#ff3e9a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 800, color: '#fff',
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 700, color: 'var(--ink,#f4efe9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artistName}</div>
              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'var(--ink-3,rgba(244,239,233,.35))', marginTop: 1 }}>{artistSlug}</div>
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px',
            borderRadius: 20, background: 'rgba(34,229,212,.08)', border: '1px solid rgba(34,229,212,.2)',
            fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: '#22e5d4',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22e5d4', display: 'inline-block' }} />
            Page live
          </div>
        </div>

        {/* nav */}
        <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <RailBtn active={mode === 'page'} onClick={() => setMode('page')} label="Page + AI" icon={<IconPage />} />
          <RailBtn active={mode === 'insights'} onClick={() => setMode('insights')} label="Insights" icon={<IconInsights />} />
          <RailBtn active={mode === 'tour'} onClick={() => setMode('tour')} label="Tour" icon={<IconTour />} />
          <RailBtn active={mode === 'release'} onClick={() => setMode('release')} label="Release" icon={<IconRelease />} />
          <RailBtn active={mode === 'library'} onClick={() => setMode('library')} label="Library" icon={<IconLibrary />} />
          <RailBtn active={mode === 'presskit'} onClick={() => setMode('presskit')} label="Press Kit" icon={<IconPressKit />} />

          <div style={{ marginTop: 16, padding: '0 4px' }}>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.25)', marginBottom: 8 }}>Quick Jump</div>
            {(['Shows', 'Merch', 'Bio'] as const).map(s => (
              <div key={s} style={{
                padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'var(--f-b,sans-serif)', fontSize: 12, color: 'rgba(244,239,233,.45)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
                onClick={() => setMode('page')}
              >
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,80,41,.5)', display: 'inline-block' }} />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* health bar */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line-2,rgba(255,255,255,.07))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)' }}>Page health</span>
            <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, color: '#22e5d4' }}>{data.profileCompletion?.percent ?? 72}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${data.profileCompletion?.percent ?? 72}%`, background: 'linear-gradient(90deg,#22e5d4,#5fd38a)', borderRadius: 99 }} />
          </div>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.35)', marginTop: 6 }}>
            {data.profileCompletion?.missing?.[0] ? `Add ${data.profileCompletion.missing[0]} to improve` : 'Add bio to reach 80%'}
          </div>
        </div>

        {/* Onboarding checklist */}
        {data.profileCompletion && data.profileCompletion.percent < 100 && (
          <ArtistOnboardingChecklist missing={data.profileCompletion.missing} onGoTo={setMode} />
        )}
      </div>

      {/* ── stage ── */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: isMobile ? 58 : 0, boxSizing: 'border-box' }}>

        {/* Mode: Page Editor */}
        {mode === 'page' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ViewPageStudio data={data} />
          </div>
        )}

        {/* Mode: Insights */}
        {mode === 'insights' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 22, fontWeight: 800, color: 'var(--ink,#f4efe9)', marginBottom: 6 }}>Insights</h2>
              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.4)', marginBottom: 24 }}>Last 30 days · updated hourly</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                <KpiCard label="Listens" value={insightsData ? insightsData.listens30d.toLocaleString() : '–'} delta="" sub="past 30 days" color="#ff5029" />
                <KpiCard label="Finish rate" value={insightsData ? `${insightsData.finishRate}%` : '–'} delta="" sub="completions / plays" color="#b983ff" />
                <KpiCard label="Save rate" value="–" delta="" sub="coming soon" color="#22e5d4" />
                <KpiCard label="Est. payout" value="–" delta="" sub="coming soon" color="#ffb84a" />
              </div>

              <ChartSection title="Listens & Engagement" subtitle="Daily streams over the past 30 days">
                <ListensChart pts={insightsData?.dailyListens} />
              </ChartSection>

              <ChartSection title="HYPE Sources" subtitle="Where your hype is coming from">
                <HypeSources />
              </ChartSection>

              <div style={{ background: 'rgba(255,80,41,.06)', border: '1px solid rgba(255,80,41,.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16 }}>✦</span>
                <div>
                  <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: '#ff5029', marginBottom: 4 }}>Trending in Milwaukee this week</div>
                  <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.6)', lineHeight: 1.5 }}>Your save rate jumped 8 pts in Milwaukee in the past 7 days — you have 410 listeners there. Consider adding a Milwaukee tour date.</div>
                </div>
              </div>

              <ChartSection title="Audience" subtitle="Top cities by listener count">
                <AudienceMap />
              </ChartSection>

              <ChartSection title="Ticket Revenue" subtitle="Sales across all platforms — past 60 days">
                <TicketRevenue />
              </ChartSection>

              <ChartSection title="Top Tracks" subtitle="Ranked by streams">
                <TopTracks tracks={insightsData?.topTracks} />
              </ChartSection>

              <ChartSection title="Discovery Funnel" subtitle="Seed view → attended">
                <DiscoveryFunnel />
              </ChartSection>

              <ChartSection title="Advertising Recommendations" subtitle="AI-suggested campaigns based on your audience data">
                <AdvertisingRecs setMode={setMode} />
              </ChartSection>

              <SimilarArtistsSection artistSlug={data.pageEditor?.slug ?? ''} />
            </div>
          </div>
        )}

        {/* Mode: Tour / Live Events */}
        {mode === 'tour' && (data.profileId ? (
          <TourManager profileId={data.profileId} artistName={artistName} existingShows={data.shows ?? []} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>🎤</div>
            <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 16, fontWeight: 700, color: 'var(--ink,#f4efe9)' }}>Tour & Events</div>
            <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.45)', textAlign: 'center', maxWidth: 280 }}>Artist profile not found. Refresh the page to reload your data.</div>
          </div>
        ))}

        {/* Mode: Library — media uploads */}
        {mode === 'library' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <div style={{ padding: '28px 32px', maxWidth: 800, margin: '0 auto' }}>
              {data.profileId ? (
                <LibraryManager profileId={data.profileId} />
              ) : (
                <p style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.4)' }}>No artist profile found.</p>
              )}
            </div>
          </div>
        )}

        {/* Mode: Release Planner */}
        {mode === 'release' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 22, fontWeight: 800, color: 'var(--ink,#f4efe9)', marginBottom: 4 }}>Release Planner</h2>
                  <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.4)' }}>
                    {selectedTrack ? `${selectedTrack.title} · ${selectedTrack.album}` : 'Select a track to plan your release'}
                  </div>
                </div>
                {data.tracks && data.tracks.length > 0 && (
                  <select
                    value={selectedTrackId ?? ''}
                    onChange={e => setSelectedTrackId(e.target.value || null)}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)',
                      color: 'var(--ink,#f4efe9)', fontFamily: 'var(--f-m,monospace)', fontSize: 12,
                      outline: 'none', cursor: 'pointer',
                    }}
                  >
                    <option value="">— pick a track —</option>
                    {data.tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                <RelStat label="Pre-saves" value="284" icon="♡" color="#ff3e9a" />
                <RelStat label="Seed plays" value="1,840" icon="▷" color="#b983ff" />
                <RelStat label="Radio adds" value="3" icon="◉" color="#22e5d4" />
                <RelStat label="Est. 1st-wk" value="4,200" icon="↗" color="#ffb84a" />
              </div>

              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 14 }}>Drop Timeline</div>
              <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
                {DROP_STEPS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < DROP_STEPS.length - 1 ? 18 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                        background: s.state === 'done' ? 'rgba(95,211,138,.15)' : s.state === 'active' ? 'rgba(255,80,41,.15)' : 'rgba(255,255,255,.05)',
                        border: `2px solid ${s.state === 'done' ? '#5fd38a' : s.state === 'active' ? '#ff5029' : 'rgba(255,255,255,.1)'}`,
                        color: s.state === 'done' ? '#5fd38a' : s.state === 'active' ? '#ff5029' : 'rgba(244,239,233,.3)',
                      }}>
                        {s.state === 'done' ? '✓' : s.state === 'active' ? '●' : '○'}
                      </div>
                      {i < DROP_STEPS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, marginTop: 4, background: i < DROP_STEPS.findIndex(x => x.state !== 'done') ? '#5fd38a' : 'rgba(255,255,255,.07)', borderRadius: 1 }} />}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: s.state === 'pending' ? 'rgba(244,239,233,.35)' : 'var(--ink,#f4efe9)', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.35)' }}>{s.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(185,131,255,.06)', border: '1px solid rgba(185,131,255,.15)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16 }}>✦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: '#b983ff', marginBottom: 4 }}>Write your announcement copy</div>
                  <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.6)', lineHeight: 1.5, marginBottom: 12 }}>Drop your one-liner about {selectedTrack?.title ?? 'this track'} and I&apos;ll write press blurbs, social captions, and a playlist pitch for you.</div>
                  <textarea
                    placeholder="What's the vibe? What's the story behind this single?"
                    rows={2}
                    style={{
                      width: '100%', resize: 'none', border: '1px solid rgba(185,131,255,.2)',
                      borderRadius: 8, padding: '9px 12px',
                      background: 'rgba(185,131,255,.06)', color: 'var(--ink,#f4efe9)',
                      fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, lineHeight: 1.5,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 12 }}>Release Bundle</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
                {BUNDLES.map((b, i) => (
                  <div key={b.label} style={{
                    background: i === 1 ? 'rgba(255,80,41,.08)' : 'var(--bg-2,#121009)',
                    border: `1px solid ${i === 1 ? 'rgba(255,80,41,.25)' : 'var(--line-2,rgba(255,255,255,.07))'}`,
                    borderRadius: 12, padding: '16px 18px', cursor: 'pointer',
                  }}>
                    <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: i === 1 ? '#ff5029' : 'var(--ink,#f4efe9)', marginBottom: 6 }}>{b.label}</div>
                    <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 12, color: 'rgba(244,239,233,.5)', lineHeight: 1.5 }}>{b.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 12 }}>First-Week Projections</div>
              <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '18px 22px' }}>
                {PROJECTIONS.map(p => (
                  <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 120, fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.5)', flexShrink: 0 }}>{p.label}</div>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: p.pct + '%', background: p.color, borderRadius: 99 }} />
                    </div>
                    <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: p.color, width: 60, textAlign: 'right', flexShrink: 0 }}>{p.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mode: Press Kit */}
        {mode === 'presskit' && (
          <PressKitPanel
            artistName={artistName}
            artistSlug={data.pageEditor?.slug ?? 'maya'}
            profileId={data.pageEditor?.profileId}
            initialBio={data.pageEditor?.bio}
          />
        )}
      </div>

      {/* ── bottom tab bar (mobile) ── */}
      {isMobile && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 58,
          display: 'flex', alignItems: 'stretch',
          background: 'rgba(10,8,5,.96)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,.08)',
          gridColumn: '1 / -1',
        }}>
          {ARTIST_TABS.map(t => (
            <button key={t.k} onClick={() => setMode(t.k)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, border: 'none', cursor: 'pointer', background: 'transparent',
              color: mode === t.k ? '#ff5029' : 'rgba(244,239,233,.4)',
              transition: 'color .15s',
            }}>
              <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.icon}</span>
              <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 8, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Artist Onboarding Checklist ─────────────────────────── */
function ArtistOnboardingChecklist({ missing, onGoTo }: { missing: string[]; onGoTo: (m: CkMode) => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || missing.length === 0) return null;
  const TASK_MAP: Record<string, { label: string; cta: string; mode: CkMode }> = {
    bio:     { label: 'Write your artist bio', cta: 'Edit page', mode: 'page' },
    photo:   { label: 'Add a press photo', cta: 'Library', mode: 'library' },
    track:   { label: 'Upload your first track', cta: 'Library', mode: 'library' },
    show:    { label: 'Schedule a show', cta: 'Tour', mode: 'tour' },
    presskit:{ label: 'Complete your press kit', cta: 'Press Kit', mode: 'presskit' },
  };
  const tasks = missing.slice(0, 5).map(m => TASK_MAP[m.toLowerCase()] ?? { label: `Add ${m}`, cta: 'Edit page', mode: 'page' as CkMode });
  return (
    <div style={{ margin: '8px 10px', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,184,74,.07)', border: '1px solid rgba(255,184,74,.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ffb84a' }}>Getting started</span>
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,239,233,.3)', fontSize: 14, lineHeight: 1, padding: 2 }}>×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 11, color: 'rgba(244,239,233,.65)', flex: 1, lineHeight: 1.35 }}>{t.label}</span>
            <button
              onClick={() => onGoTo(t.mode)}
              style={{ padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', background: 'rgba(255,184,74,.18)', color: '#ffb84a', fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, flexShrink: 0 }}
            >{t.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Similar Artists Section ─────────────────────────────── */
function SimilarArtistsSection({ artistSlug }: { artistSlug: string }) {
  const [artists, setArtists] = useState<{ name: string; slug: string; reason: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!artistSlug || fetched) return;
    setFetched(true);
    setLoading(true);
    fetch(`/api/artists/${encodeURIComponent(artistSlug)}/sounds-like`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { artists?: { name: string; slug: string; reason: string }[] } | null) => {
        if (d?.artists?.length) setArtists(d.artists.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [artistSlug, fetched]);

  if (!loading && artists.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 14 }}>Sounds Like</div>
      {loading ? (
        <div style={{ display: 'flex', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ width: 100, height: 60, borderRadius: 10, background: 'var(--bg-2)', animation: 'shimmer 1.4s infinite' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {artists.map(a => (
            <a key={a.slug} href={`/artists/${a.slug}`} target="_blank" rel="noopener noreferrer" style={{
              padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
              background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))',
              display: 'flex', flexDirection: 'column', gap: 3, minWidth: 120,
            }}>
              <span style={{ fontFamily: 'var(--f-d,sans-serif)', fontWeight: 700, fontSize: 13, color: 'var(--ink,#f4efe9)' }}>{a.name}</span>
              <span style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 11, color: 'rgba(244,239,233,.4)', lineHeight: 1.35 }}>{a.reason}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Press Kit Panel ─────────────────────────────────────── */
function PressKitPanel({ artistName, artistSlug, profileId, initialBio }: { artistName: string; artistSlug: string; profileId?: string; initialBio?: string }) {
  const defaultBio = `${artistName} makes late-night songs for long drives. Based in Chicago, IL, their sound blends hazy guitar work with confessional lyrics that land somewhere between indie folk and alternative pop. Their debut EP, recorded live in a basement on Western Ave, has accumulated over 2,000 streams and counting.`;
  const [bio, setBio] = useState(initialBio || defaultBio);
  const [riderChecks, setRiderChecks] = useState<Record<string, boolean>>({
    'PA system (min 1,000W)': true,
    'Stage monitors (x2)': true,
    'Direct box (x2)': false,
    'Drum kit (full)': false,
    'Green room access': true,
    'Merch table': true,
  });
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleRider(key: string) {
    setRiderChecks(c => ({ ...c, [key]: !c[key] }));
  }

  function copyLink() {
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://ihype.org'}/artists/${artistSlug}/epk`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function savePressKit() {
    if (!profileId) return;
    setSaving(true);
    try {
      const riderJson = JSON.stringify(
        Object.entries(riderChecks).filter(([, v]) => v).map(([k]) => k)
      );
      await fetch('/api/profile-editor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, bio, aboutContent: riderJson }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
      <div style={{ padding: '28px 32px', maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 22, fontWeight: 800, color: 'var(--ink,#f4efe9)', marginBottom: 4 }}>Press Kit · EPK</h2>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.4)' }}>Electronic Press Kit for {artistName}</div>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#ff5029', color: '#fff',
            fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 3v12M7 14l5 5 5-5M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            DOWNLOAD EPK
          </button>
        </div>

        {/* Artist bio */}
        <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '20px 22px', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)', marginBottom: 12 }}>Artist Bio</div>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={5}
            style={{
              ...INPUT_STYLE,
              resize: 'vertical',
              lineHeight: 1.65,
              minHeight: 100,
            }}
          />
          {profileId && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={savePressKit}
                disabled={saving}
                style={{
                  padding: '7px 18px', borderRadius: 8, border: 'none', cursor: saving ? 'default' : 'pointer',
                  background: saved ? 'rgba(95,211,138,.15)' : '#ff5029',
                  color: saved ? '#5fd38a' : '#fff',
                  fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700,
                  opacity: saving ? 0.6 : 1, transition: 'all .15s',
                }}
              >
                {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Bio'}
              </button>
            </div>
          )}
        </div>

        {/* Key stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Streams', value: '2,284', color: '#ff5029' },
            { label: 'Shows', value: '12', color: '#b983ff' },
            { label: 'Cities', value: '4', color: '#22e5d4' },
            { label: 'Avg Draw', value: '240', color: '#ffb84a' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))',
              borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: 6 }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tech rider */}
        <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '20px 22px', marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)', marginBottom: 14 }}>Tech Rider</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(riderChecks).map(([item, checked]) => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => toggleRider(item)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${checked ? '#22e5d4' : 'rgba(255,255,255,.2)'}`,
                    background: checked ? 'rgba(34,229,212,.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s', cursor: 'pointer',
                  }}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#22e5d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: checked ? 'var(--ink,#f4efe9)' : 'rgba(244,239,233,.45)' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Press photos */}
        <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '20px 22px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)' }}>Press Photos</div>
            <button style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,80,41,.3)',
              background: 'rgba(255,80,41,.08)', color: '#ff5029',
              fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>
              + Add photo
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: 140, borderRadius: 10, border: '1px dashed rgba(255,255,255,.12)',
                background: `linear-gradient(135deg, rgba(255,80,41,${0.06 + i * 0.02}), rgba(185,131,255,${0.06 + i * 0.02}))`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(244,239,233,.25)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.25)', letterSpacing: '.06em' }}>Photo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shareable link */}
        <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)', marginBottom: 10 }}>Shareable Link</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              flex: 1, padding: '9px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.55)',
            }}>
              ihype.org/artists/{artistSlug}/epk
            </div>
            <button
              onClick={copyLink}
              style={{
                padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(34,229,212,.25)',
                background: copied ? 'rgba(34,229,212,.15)' : 'rgba(34,229,212,.06)',
                color: '#22e5d4',
                fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all .15s', flexShrink: 0,
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Insights sub-components ─────────────────────────────── */
function KpiCard({ label, value, delta, sub, color }: { label: string; value: string; delta: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 28, fontWeight: 800, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, color: '#5fd38a' }}>{delta}</span>
        <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.3)' }}>{sub}</span>
      </div>
    </div>
  );
}

function ChartSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '20px 22px', marginBottom: 18 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 15, fontWeight: 700, color: 'var(--ink,#f4efe9)' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.35)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function ListensChart({ pts: livePts }: { pts?: number[] }) {
  const pts = (livePts && livePts.length > 0) ? livePts : [40, 55, 48, 72, 68, 90, 85, 110, 95, 120, 105, 130, 115, 140, 125, 155, 140, 170, 145, 180, 160, 190, 175, 200, 185, 210, 195, 220, 205, 230];
  const max = Math.max(...pts);
  const h = 80; const w = 600;
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: 100 }}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5029" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff5029" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d + ` L${w},${h} L0,${h} Z`} fill="url(#lg1)" />
      <path d={d} fill="none" stroke="#ff5029" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function HypeSources() {
  const items = [
    { label: 'Direct plays', pct: 42, color: '#ff5029' },
    { label: 'Seed discovery', pct: 28, color: '#b983ff' },
    { label: 'Shared links', pct: 18, color: '#22e5d4' },
    { label: 'Radio', pct: 12, color: '#ffb84a' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 100, fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.5)', flexShrink: 0 }}>{item.label}</div>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: item.pct + '%', background: item.color, borderRadius: 99 }} />
          </div>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, fontWeight: 700, color: item.color, width: 36, textAlign: 'right', flexShrink: 0 }}>{item.pct}%</div>
        </div>
      ))}
    </div>
  );
}

function AudienceMap() {
  const cities = [
    { city: 'Chicago', count: 1120, x: 52, y: 42 },
    { city: 'Milwaukee', count: 410, x: 54, y: 34 },
    { city: 'Detroit', count: 360, x: 68, y: 38 },
    { city: 'Cleveland', count: 280, x: 72, y: 44 },
    { city: 'Indianapolis', count: 190, x: 62, y: 52 },
  ];
  const max = Math.max(...cities.map(c => c.count));
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: '0 0 220px', position: 'relative', height: 120, background: 'rgba(255,255,255,.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
        {cities.map(c => (
          <div key={c.city} style={{
            position: 'absolute', left: c.x + '%', top: c.y + '%',
            width: Math.max(6, (c.count / max) * 18), height: Math.max(6, (c.count / max) * 18),
            borderRadius: '50%', background: '#ff5029', opacity: 0.6,
            transform: 'translate(-50%, -50%)',
          }} title={c.city} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cities.map(c => (
          <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 70, fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.5)', flexShrink: 0 }}>{c.city}</div>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: (c.count / max * 100) + '%', background: 'linear-gradient(90deg,#ff5029,#ff3e9a)', borderRadius: 99 }} />
            </div>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, color: 'var(--ink,#f4efe9)', width: 40, textAlign: 'right', flexShrink: 0 }}>{c.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketRevenue() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 28, fontWeight: 800, color: '#ffb84a' }}>$4,280</div>
        <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.4)' }}>gross, 3 shows</div>
      </div>
      <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ width: '45%', background: '#ff5029' }} title="Door" />
        <div style={{ width: '45%', background: '#b983ff' }} title="Advance" />
        <div style={{ width: '10%', background: '#22e5d4' }} title="Comp" />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {[{ label: 'Door', pct: '45%', color: '#ff5029' }, { label: 'Advance', pct: '45%', color: '#b983ff' }, { label: 'Comp', pct: '10%', color: '#22e5d4' }].map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color }} />
            <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.5)' }}>{t.label} {t.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopTracks({ tracks: liveTracks }: { tracks?: Array<{title: string; listens: number}> }) {
  const fallback = [
    { title: 'Velvet Hours', streams: 820, saves: 214 },
    { title: 'Carmine', streams: 610, saves: 178 },
    { title: 'Westbound', streams: 490, saves: 142 },
    { title: 'North Shore', streams: 364, saves: 98 },
  ];
  const tracks = liveTracks && liveTracks.length > 0
    ? liveTracks.map(t => ({ title: t.title, streams: t.listens, saves: 0 }))
    : fallback;
  const max = tracks[0].streams;
  return (
    <div>
      {tracks.map((t, i) => (
        <div key={t.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < tracks.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
          <div style={{ width: 18, fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.3)', textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'var(--ink,#f4efe9)' }}>{t.title}</div>
          <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', width: (t.streams / max * 100) + '%', background: '#ff5029', borderRadius: 99 }} />
          </div>
          <div style={{ width: 44, fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, color: 'var(--ink,#f4efe9)', textAlign: 'right', flexShrink: 0 }}>{t.streams}</div>
          {t.saves > 0 && <div style={{ width: 44, fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.4)', textAlign: 'right', flexShrink: 0 }}>♡ {t.saves}</div>}
        </div>
      ))}
    </div>
  );
}

function DiscoveryFunnel() {
  const steps = [
    { label: 'Seed views', value: 18400, color: '#ff5029' },
    { label: 'Saved', value: 4780, color: '#b983ff' },
    { label: 'Tickets sold', value: 612, color: '#22e5d4' },
    { label: 'Attended', value: 540, color: '#5fd38a' },
  ];
  const max = steps[0].value;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 88, fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.5)', flexShrink: 0 }}>{s.label}</div>
          <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,.04)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (s.value / max * 100) + '%', background: s.color, borderRadius: 4, opacity: 0.8 }} />
          </div>
          <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 700, color: s.color, width: 52, textAlign: 'right', flexShrink: 0 }}>{s.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Tour sub-components ─────────────────────────────────── */
type LiveShow = {
  id: string; name: string; venue: string; date: string; time: string;
  hype: number; sold: number; capacity: number; price: number;
  status: 'TONIGHT' | 'THIS WEEK' | 'UPCOMING' | 'NEAR SOLD' | 'ENDED';
};

type TourView = 'list' | 'create';

function ShowStatusChip({ status }: { status: LiveShow['status'] }) {
  const cfg: Record<LiveShow['status'], { label: string; color: string; bg: string }> = {
    TONIGHT:   { label: 'Tonight',   color: '#ff5029', bg: 'rgba(255,80,41,.12)' },
    'THIS WEEK': { label: 'This week', color: '#ffb84a', bg: 'rgba(255,184,74,.1)' },
    UPCOMING:  { label: 'Upcoming',  color: 'rgba(244,239,233,.5)', bg: 'rgba(255,255,255,.05)' },
    'NEAR SOLD': { label: 'Near sold', color: '#5fd38a', bg: 'rgba(95,211,138,.1)' },
    ENDED:     { label: 'Ended',     color: 'rgba(244,239,233,.3)', bg: 'rgba(255,255,255,.04)' },
  };
  const c = cfg[status];
  return (
    <span style={{ padding: '3px 9px', borderRadius: 20, fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

function TourManager({ profileId, artistName, existingShows }: { profileId: string; artistName: string; existingShows: LiveShow[] }) {
  const [view, setView] = useState<TourView>('list');
  const [shows, setShows] = useState<LiveShow[]>(existingShows.filter(s => s.status !== 'ENDED'));
  const [pastShows] = useState<LiveShow[]>(existingShows.filter(s => s.status === 'ENDED'));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [timeVal, setTimeVal] = useState('20:00');
  const [ticketed, setTicketed] = useState(false);
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [asDraft, setAsDraft] = useState(false);

  function resetForm() {
    setTitle(''); setVenue(''); setCity(''); setDateVal(''); setTimeVal('20:00');
    setTicketed(false); setPrice(''); setCapacity(''); setDescription(''); setAsDraft(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !dateVal || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const startsAt = new Date(`${dateVal}T${timeVal}:00`).toISOString();
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        isRadioShow: false,
        status: asDraft ? 'DRAFT' : 'SCHEDULED',
        startsAt,
        headlinerProfileId: profileId,
        isTicketed: ticketed,
        ticketPriceCents: ticketed && price ? Math.round(parseFloat(price) * 100) : 0,
        ticketCapacity: ticketed && capacity ? parseInt(capacity, 10) : null,
        venueText: `${venue.trim()}${city.trim() ? ', ' + city.trim() : ''}`,
      };
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({})) as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Could not create show.');
      const d = new Date(`${dateVal}T${timeVal}:00`);
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      const status: LiveShow['status'] = diff < 86400000 && diff > 0 ? 'TONIGHT' : diff < 7 * 86400000 && diff > 0 ? 'THIS WEEK' : 'UPCOMING';
      setShows(prev => [{
        id: json.id ?? Math.random().toString(36).slice(2),
        name: title.trim(),
        venue: venue.trim(),
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        hype: 0, sold: 0,
        capacity: ticketed && capacity ? parseInt(capacity, 10) : 0,
        price: ticketed && price ? parseFloat(price) : 0,
        status,
      }, ...prev]);
      resetForm();
      setView('list');
      setNotice({ text: asDraft ? 'Saved as draft.' : 'Show scheduled and live on your page.', ok: true });
    } catch (err) {
      setNotice({ text: err instanceof Error ? err.message : 'Failed.', ok: false });
    } finally {
      setBusy(false);
    }
  }

  const upcomingCount = shows.length;
  const totalHype = shows.reduce((s, x) => s + x.hype, 0);
  const totalSold = shows.reduce((s, x) => s + x.sold, 0);

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 22, fontWeight: 800, color: 'var(--ink,#f4efe9)', marginBottom: 4 }}>Tour & Events</h2>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.4)' }}>
              {upcomingCount} upcoming · {totalHype} hype · {totalSold} tickets sold
            </div>
          </div>
          {view === 'list' ? (
            <button
              onClick={() => { setNotice(null); setView('create'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: '#ff5029', color: '#fff',
                fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
              ADD DATE
            </button>
          ) : (
            <button
              onClick={() => { resetForm(); setNotice(null); setView('list'); }}
              style={{
                padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)',
                background: 'transparent', color: 'rgba(244,239,233,.5)',
                fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {notice && (
          <div style={{
            marginBottom: 20, padding: '10px 16px', borderRadius: 8,
            background: notice.ok ? 'rgba(95,211,138,.08)' : 'rgba(255,80,41,.08)',
            border: `1px solid ${notice.ok ? 'rgba(95,211,138,.2)' : 'rgba(255,80,41,.2)'}`,
            fontFamily: 'var(--f-b,sans-serif)', fontSize: 13,
            color: notice.ok ? '#5fd38a' : '#ff5029',
          }}>
            {notice.text}
          </div>
        )}

        {view === 'create' && (
          <form onSubmit={submit} style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 18 }}>New Event</div>

            <div style={{ display: 'grid', gap: 14 }}>
              <input style={INPUT_STYLE} placeholder="Event title *" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input style={INPUT_STYLE} placeholder="Venue name *" value={venue} onChange={e => setVenue(e.target.value)} maxLength={100} required />
                <input style={INPUT_STYLE} placeholder="City, State" value={city} onChange={e => setCity(e.target.value)} maxLength={80} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.4)', marginBottom: 5 }}>DATE *</div>
                  <input type="date" style={INPUT_STYLE} value={dateVal} onChange={e => setDateVal(e.target.value)} required />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.4)', marginBottom: 5 }}>TIME</div>
                  <input type="time" style={INPUT_STYLE} value={timeVal} onChange={e => setTimeVal(e.target.value)} />
                </div>
              </div>

              <textarea
                style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 72 }}
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
              />

              <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '14px 16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: ticketed ? 14 : 0 }}>
                  <div
                    onClick={() => setTicketed(t => !t)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0,
                      background: ticketed ? '#ff5029' : 'rgba(255,255,255,.1)',
                      transition: 'background .2s', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: ticketed ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      transition: 'left .2s',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'var(--ink,#f4efe9)' }}>Sell tickets</span>
                </label>
                {ticketed && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.4)', marginBottom: 5 }}>PRICE (USD)</div>
                      <input type="number" min="0" step="0.01" style={INPUT_STYLE} placeholder="e.g. 15.00" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.4)', marginBottom: 5 }}>CAPACITY</div>
                      <input type="number" min="1" style={INPUT_STYLE} placeholder="e.g. 200" value={capacity} onChange={e => setCapacity(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={asDraft} onChange={e => setAsDraft(e.target.checked)} style={{ accentColor: '#ff5029' }} />
                <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.45)' }}>Save as draft (not public yet)</span>
              </label>
              <button
                type="submit"
                disabled={busy || !title.trim() || !venue.trim() || !dateVal}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none', cursor: busy ? 'default' : 'pointer',
                  background: busy || !title.trim() || !venue.trim() || !dateVal ? 'rgba(255,80,41,.3)' : '#ff5029',
                  color: '#fff', fontFamily: 'var(--f-m,monospace)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em',
                }}
              >
                {busy ? 'Saving…' : asDraft ? 'SAVE DRAFT' : 'PUBLISH EVENT'}
              </button>
            </div>
          </form>
        )}

        {shows.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 12 }}>Upcoming</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {shows.map(s => (
                <div key={s.id} style={{
                  background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))',
                  borderRadius: 12, padding: '14px 18px',
                  display: 'grid', gridTemplateColumns: '80px 1fr auto auto', alignItems: 'center', gap: 14,
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, fontWeight: 700, color: 'var(--ink,#f4efe9)' }}>{s.date}</div>
                    <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.4)', marginTop: 2 }}>{s.time}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: 'var(--ink,#f4efe9)', marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.4)' }}>
                      {s.venue}
                      {s.capacity > 0 && <span> · {s.sold}/{s.capacity} sold</span>}
                      {s.hype > 0 && <span> · {s.hype} hype</span>}
                    </div>
                  </div>
                  <ShowStatusChip status={s.status} />
                  {s.price > 0 && (
                    <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: '#ffb84a' }}>
                      ${s.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {shows.length === 0 && view === 'list' && (
          <div style={{
            background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))',
            borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginBottom: 28,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎤</div>
            <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 16, fontWeight: 700, color: 'var(--ink,#f4efe9)', marginBottom: 6 }}>No upcoming events</div>
            <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.4)', marginBottom: 20 }}>
              Add a date to get it live on your page and start selling tickets.
            </div>
            <button
              onClick={() => setView('create')}
              style={{
                padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: '#ff5029', color: '#fff',
                fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700,
              }}
            >
              ADD FIRST DATE
            </button>
          </div>
        )}

        {pastShows.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(244,239,233,.4)', marginBottom: 12 }}>Past</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pastShows.map(s => (
                <div key={s.id} style={{
                  background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)',
                  borderRadius: 10, padding: '12px 18px',
                  display: 'grid', gridTemplateColumns: '80px 1fr auto', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.35)' }}>{s.date}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.5)' }}>{s.name}</div>
                    <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.25)', marginTop: 2 }}>
                      {s.venue}
                      {s.sold > 0 && <span> · {s.sold} attended</span>}
                      {s.hype > 0 && <span> · {s.hype} hype</span>}
                    </div>
                  </div>
                  <ShowStatusChip status="ENDED" />
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 28, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.3)', lineHeight: 1.6 }}>
          Events you publish here appear on your public {artistName} page. Ticketed shows go live for purchase immediately after publishing.
        </div>
      </div>
    </div>
  );
}

/* ── Release sub-components ──────────────────────────────── */
function RelStat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(244,239,233,.35)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>
        {icon} {value}
      </div>
    </div>
  );
}

const DROP_STEPS = [
  { label: 'Upload & master', note: 'Done · Jun 1', state: 'done' as const },
  { label: 'Cut seed active', note: 'Live · 1,840 views', state: 'active' as const },
  { label: 'Schedule drop', note: 'Jun 14 · pending', state: 'pending' as const },
  { label: 'Radio & playlist pitch', note: '3 playlists queued', state: 'pending' as const },
  { label: 'Announce to fans', note: 'Social + email draft', state: 'pending' as const },
];

const BUNDLES = [
  { label: 'Single', desc: 'Track + seed + release post. Best for quick drops.' },
  { label: 'Launch Pack', desc: 'Single + social kit + playlist pitch + bio update. Recommended.' },
  { label: 'Full Push', desc: 'Launch Pack + radio outreach + press kit + tour hook.' },
];

const PROJECTIONS = [
  { label: 'Streams wk 1', value: '4,200', pct: 60, color: '#ff5029' },
  { label: 'New followers', value: '340', pct: 40, color: '#b983ff' },
  { label: 'Saves', value: '1,100', pct: 50, color: '#22e5d4' },
  { label: 'Est. revenue', value: '$190', pct: 25, color: '#ffb84a' },
];

/* ── Icons ───────────────────────────────────────────────── */
function IconPage() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
}
function IconInsights() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h18M8 16V8M12 16V4M16 16v-6" strokeLinecap="round" /></svg>;
}
function IconTour() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M6 16V7a1 1 0 011-1h10l2 5v5" strokeLinejoin="round" /><path d="M6 16h12" /></svg>;
}
function IconRelease() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" strokeLinecap="round" /></svg>;
}
function IconLibrary() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>;
}
function IconPressKit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── AdvertisingRecs ─────────────────────────────────────── */
function AdvertisingRecs({ setMode }: { setMode: (m: CkMode) => void }) {
  const recs = [
    {
      color: '#ffb84a',
      title: 'Boost Milwaukee reach',
      body: 'Your save rate in Milwaukee jumped 8pts this week. Run a 3-day local boost to capture momentum.',
      action: 'Create campaign →',
      onAction: () => {},
    },
    {
      color: '#22e5d4',
      title: 'Seed a new release',
      body: 'Tracks submitted to Seeds in the first 48h after upload get 3× more saves. Your next drop should go to Seeds day-of-release.',
      action: 'Submit to Seeds →',
      onAction: () => {},
    },
    {
      color: '#b983ff',
      title: 'DJ radio placement',
      body: '7 DJs in your genre have open radio show slots this week. Enable free use on your top track to get placed.',
      action: 'Enable free use →',
      onAction: () => setMode('library'),
    },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {recs.map(rec => (
        <div
          key={rec.title}
          style={{
            background: `rgba(${hexToRgb(rec.color)},.05)`,
            border: `1px solid rgba(${hexToRgb(rec.color)},.18)`,
            borderRadius: 10,
            padding: '14px 16px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 14, marginTop: 1, color: rec.color }}>✦</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 700, color: rec.color, marginBottom: 4 }}>{rec.title}</div>
            <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.6)', lineHeight: 1.5, marginBottom: 10 }}>{rec.body}</div>
            <button
              onClick={rec.onAction}
              style={{
                background: 'transparent',
                border: `1px solid rgba(${hexToRgb(rec.color)},.3)`,
                borderRadius: 6,
                padding: '5px 12px',
                fontFamily: 'var(--f-m,monospace)',
                fontSize: 11,
                fontWeight: 700,
                color: rec.color,
                cursor: 'pointer',
                letterSpacing: '.04em',
              }}
            >
              {rec.action}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ── LibraryManager ──────────────────────────────────────── */
type MediaTrack = {
  hexId: string;
  title: string;
  notes: string;
  mimeType: string;
  fileSizeBytes: number;
  freeUseEnabled: boolean;
  createdAt: string;
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}

function LibraryManager({ profileId }: { profileId: string }) {
  const [tracks, setTracks] = useState<MediaTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Record<string, { title: string; notes: string; freeUseEnabled: boolean }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFreeUse, setUploadFreeUse] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string; width: number; height: number } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadedUrl, setImageUploadedUrl] = useState<string | null>(null);
  const [imageCopied, setImageCopied] = useState(false);
  const [albumNotes, setAlbumNotes] = useState('');
  const [albumNotesSaved, setAlbumNotesSaved] = useState(false);
  const [submittedSeeds, setSubmittedSeeds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<File | null>(null);

  const SUBMITTED_KEY = 'ihype-submitted-seeds';
  const ALBUM_NOTES_KEY = `ihype-album-notes-${profileId}`;

  useEffect(() => {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    if (raw) {
      try { setSubmittedSeeds(new Set(JSON.parse(raw))); } catch { /* ignore */ }
    }
    const an = localStorage.getItem(ALBUM_NOTES_KEY);
    if (an) setAlbumNotes(an);
  }, [profileId, ALBUM_NOTES_KEY]);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/artist-media?profileId=${profileId}`);
      if (res.ok) {
        const json = await res.json();
        setTracks(json.tracks ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  function startEdit(t: MediaTrack) {
    setEditState(prev => ({ ...prev, [t.hexId]: { title: t.title, notes: t.notes, freeUseEnabled: t.freeUseEnabled } }));
    setExpandedId(t.hexId);
  }

  async function saveTrack(hexId: string) {
    const e = editState[hexId];
    if (!e) return;
    setSaving(prev => ({ ...prev, [hexId]: true }));
    try {
      await fetch(`/api/artist-media/${hexId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e),
      });
      setTracks(prev => prev.map(t => t.hexId === hexId ? { ...t, ...e } : t));
      setExpandedId(null);
    } finally {
      setSaving(prev => ({ ...prev, [hexId]: false }));
    }
  }

  async function deleteTrack(hexId: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/artist-media/${hexId}`, { method: 'DELETE' });
    setTracks(prev => prev.filter(t => t.hexId !== hexId));
  }

  const [seedMsg, setSeedMsg] = useState('');

  function submitToSeeds(hexId: string) {
    const next = new Set(submittedSeeds);
    next.add(hexId);
    setSubmittedSeeds(next);
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify([...next]));
    setSeedMsg('Added to Seeds discovery queue');
    setTimeout(() => setSeedMsg(''), 3000);
  }

  async function handleUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileId', profileId);
      formData.append('title', uploadTitle || file.name.replace(/\.[^.]+$/, ''));
      formData.append('notes', uploadNotes);
      formData.append('freeUseEnabled', String(uploadFreeUse));
      await fetch('/api/artist-media', { method: 'POST', body: formData });
      setUploadTitle('');
      setUploadNotes('');
      setUploadFreeUse(false);
      uploadFileRef.current = null;
      await fetchTracks();
    } finally {
      setUploading(false);
    }
  }

  function handleImageDrop(file: File) {
    const localUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImagePreview({ url: localUrl, name: file.name, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = localUrl;
    setImageUploadedUrl(null);
    setImageUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/profile/upload-graphic', { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { url: string }) => setImageUploadedUrl(d.url))
      .catch(() => {})
      .finally(() => setImageUploading(false));
  }

  function saveAlbumNotes() {
    localStorage.setItem(ALBUM_NOTES_KEY, albumNotes);
    setAlbumNotesSaved(true);
    setTimeout(() => setAlbumNotesSaved(false), 2000);
  }

  const sx = {
    label: { fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: 'rgba(244,239,233,.4)', marginBottom: 6 },
    card: { background: 'var(--bg-2,#121009)', border: '1px solid var(--line-2,rgba(255,255,255,.07))', borderRadius: 12, padding: '16px 18px', marginBottom: 12 },
    input: { width: '100%', boxSizing: 'border-box' as const, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px', color: 'var(--ink,#f4efe9)', fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, outline: 'none' },
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 22, fontWeight: 800, color: 'var(--ink,#f4efe9)', marginBottom: 4 }}>Library</h2>
      <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.4)', marginBottom: 28 }}>
        {loading ? 'Loading…' : `${tracks.length} track${tracks.length !== 1 ? 's' : ''} in library`}
      </div>

      {/* ── Upload zone ── */}
      <div style={{ ...sx.card, marginBottom: 24 }}>
        <div style={sx.label}>Upload new track</div>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) { uploadFileRef.current = file; }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#ff5029' : 'rgba(255,255,255,.12)'}`,
            borderRadius: 10, padding: '22px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(255,80,41,.06)' : 'rgba(255,255,255,.02)',
            marginBottom: 14, transition: 'all .15s',
          }}
        >
          <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: 'var(--ink,#f4efe9)', marginBottom: 4 }}>Drop audio file here</div>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.35)' }}>or click to browse · MP3, WAV, FLAC, AAC</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFileRef.current = f; }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={sx.label}>Title</div>
            <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Track title" style={sx.input} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
            <input
              type="checkbox"
              id="lib-free-use"
              checked={uploadFreeUse}
              onChange={e => setUploadFreeUse(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#ff5029' }}
            />
            <label htmlFor="lib-free-use" style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.7)', cursor: 'pointer' }}>
              Enable free use <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.35)' }}>(allows DJs to add to radio shows)</span>
            </label>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={sx.label}>Track notes</div>
          <textarea
            value={uploadNotes}
            onChange={e => setUploadNotes(e.target.value)}
            placeholder="BPM, key, stems available, version info…"
            rows={2}
            style={{ ...sx.input, resize: 'none' }}
          />
        </div>
        <button
          disabled={uploading}
          onClick={() => { if (uploadFileRef.current) handleUpload(uploadFileRef.current); }}
          style={{
            background: uploading ? 'rgba(255,80,41,.4)' : '#ff5029',
            border: 'none', borderRadius: 8, padding: '9px 20px',
            fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 700,
            color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading…' : 'Upload Track'}
        </button>
      </div>

      {/* ── Track list ── */}
      {loading ? (
        <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 12, color: 'rgba(244,239,233,.3)', padding: '12px 0' }}>Loading tracks…</div>
      ) : tracks.length === 0 ? (
        <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.3)', padding: '12px 0' }}>No tracks yet — upload your first track above.</div>
      ) : (
        <div style={{ marginBottom: 28 }}>
          <div style={sx.label}>Tracks</div>
          {tracks.map(track => {
            const isExpanded = expandedId === track.hexId;
            const ed = editState[track.hexId];
            const isSubmitted = submittedSeeds.has(track.hexId);
            return (
              <div key={track.hexId} style={{ ...sx.card, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 14, fontWeight: 700, color: 'var(--ink,#f4efe9)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.35)' }}>{formatBytes(track.fileSizeBytes)}</span>
                      <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.25)' }}>·</span>
                      <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.35)' }}>{new Date(track.createdAt).toLocaleDateString()}</span>
                      {track.freeUseEnabled && (
                        <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: '#22e5d4', background: 'rgba(34,229,212,.1)', border: '1px solid rgba(34,229,212,.2)', borderRadius: 4, padding: '2px 6px' }}>FREE USE</span>
                      )}
                    </div>
                    {track.notes && !isExpanded && (
                      <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 12, color: 'rgba(244,239,233,.4)', marginTop: 6, lineHeight: 1.4 }}>
                        {track.notes.slice(0, 80)}{track.notes.length > 80 ? '…' : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => isExpanded ? setExpandedId(null) : startEdit(track)}
                      style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '5px 10px', fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.6)', cursor: 'pointer' }}
                    >
                      {isExpanded ? 'Close' : 'Edit'}
                    </button>
                    <button
                      onClick={() => submitToSeeds(track.hexId)}
                      disabled={isSubmitted}
                      style={{
                        background: isSubmitted ? 'rgba(95,211,138,.08)' : 'rgba(185,131,255,.08)',
                        border: `1px solid ${isSubmitted ? 'rgba(95,211,138,.2)' : 'rgba(185,131,255,.2)'}`,
                        borderRadius: 6, padding: '5px 10px',
                        fontFamily: 'var(--f-m,monospace)', fontSize: 11,
                        color: isSubmitted ? '#5fd38a' : '#b983ff',
                        cursor: isSubmitted ? 'default' : 'pointer',
                      }}
                    >
                      {isSubmitted ? 'Submitted ✓' : 'Submit to Seeds'}
                    </button>
                    <button
                      onClick={() => deleteTrack(track.hexId, track.title)}
                      style={{ background: 'rgba(255,80,41,.06)', border: '1px solid rgba(255,80,41,.15)', borderRadius: 6, padding: '5px 10px', fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: '#ff5029', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                    {seedMsg && isSubmitted && (
                      <span style={{ color: '#22e5d4', fontFamily: 'var(--f-m,monospace)', fontSize: 11, marginLeft: 8, alignSelf: 'center' }}>{seedMsg}</span>
                    )}
                  </div>
                </div>

                {isExpanded && ed && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={sx.label}>Title</div>
                      <input
                        value={ed.title}
                        onChange={e => setEditState(prev => ({ ...prev, [track.hexId]: { ...prev[track.hexId], title: e.target.value } }))}
                        style={sx.input}
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={sx.label}>Track notes</div>
                      <textarea
                        value={ed.notes}
                        onChange={e => setEditState(prev => ({ ...prev, [track.hexId]: { ...prev[track.hexId], notes: e.target.value } }))}
                        placeholder="BPM, key, stems available, version info, licensing notes…"
                        rows={3}
                        style={{ ...sx.input, resize: 'vertical' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <input
                        type="checkbox"
                        id={`fu-${track.hexId}`}
                        checked={ed.freeUseEnabled}
                        onChange={e => setEditState(prev => ({ ...prev, [track.hexId]: { ...prev[track.hexId], freeUseEnabled: e.target.checked } }))}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#ff5029' }}
                      />
                      <label htmlFor={`fu-${track.hexId}`} style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'rgba(244,239,233,.7)', cursor: 'pointer' }}>Enable free use (allows DJs to add to radio shows)</label>
                    </div>
                    <button
                      onClick={() => saveTrack(track.hexId)}
                      disabled={saving[track.hexId]}
                      style={{
                        background: saving[track.hexId] ? 'rgba(255,80,41,.4)' : '#ff5029',
                        border: 'none', borderRadius: 8, padding: '8px 18px',
                        fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 700,
                        color: '#fff', cursor: saving[track.hexId] ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {saving[track.hexId] ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Cover Art & Graphics ── */}
      <div style={{ ...sx.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={sx.label}>Cover Art & Graphics</div>
          {imageUploading && <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: 'rgba(244,239,233,.4)' }}>Uploading…</span>}
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
          onDragLeave={() => setImageDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setImageDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) handleImageDrop(file);
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/gif,image/webp';
            input.onchange = () => { if (input.files?.[0]) handleImageDrop(input.files[0]); };
            input.click();
          }}
          style={{
            border: `2px dashed ${imageDragOver ? '#ffb84a' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer',
            background: imageDragOver ? 'rgba(255,184,74,.05)' : 'rgba(255,255,255,.02)',
            marginBottom: imagePreview ? 14 : 0, transition: 'all .15s',
          }}
        >
          <div style={{ fontFamily: 'var(--f-d,sans-serif)', fontSize: 13, fontWeight: 700, color: 'rgba(244,239,233,.5)', marginBottom: 4 }}>Drop image or click to browse</div>
          <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.25)' }}>JPEG · PNG · GIF · WebP · max 8 MB</div>
        </div>
        {imagePreview && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img src={imagePreview.url} alt="preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 13, color: 'var(--ink,#f4efe9)', marginBottom: 4 }}>{imagePreview.name}</div>
              <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.4)', marginBottom: 10 }}>{imagePreview.width} × {imagePreview.height} px</div>
              {imageUploadedUrl && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: '#5fd38a', marginBottom: 6 }}>Uploaded — copy URL to use in page builder</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      readOnly
                      value={imageUploadedUrl}
                      style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '5px 8px', color: 'rgba(244,239,233,.6)', fontFamily: 'var(--f-m,monospace)', fontSize: 10, outline: 'none' }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(imageUploadedUrl).catch(() => {});
                        setImageCopied(true);
                        setTimeout(() => setImageCopied(false), 1500);
                      }}
                      style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,184,74,.3)', background: 'none', color: '#ffb84a', fontFamily: 'var(--f-m,monospace)', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {imageCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
              {imageUploading && !imageUploadedUrl && (
                <div style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 11, color: 'rgba(244,239,233,.3)' }}>Uploading…</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Album / Project Notes ── */}
      <div style={sx.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={sx.label}>Album / Project Notes</div>
          {albumNotesSaved && <span style={{ fontFamily: 'var(--f-m,monospace)', fontSize: 10, color: '#5fd38a' }}>Saved locally</span>}
        </div>
        <div style={{ fontFamily: 'var(--f-b,sans-serif)', fontSize: 12, color: 'rgba(244,239,233,.35)', marginBottom: 8 }}>Concept, credits, release context — local scratchpad, not published</div>
        <textarea
          value={albumNotes}
          onChange={e => setAlbumNotes(e.target.value)}
          onBlur={saveAlbumNotes}
          placeholder="Album concept, credits, release context…"
          rows={5}
          style={{ ...sx.input, resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

export default ViewArtistPage;
