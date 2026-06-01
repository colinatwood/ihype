'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  artist, venue, DATES, RADII, RADIUS_M, FAN_SCALE, scoreComp,
  type BMVenue, type BMArtist, type BMCobill, type BMPromoter, type Grade,
} from '@/lib/bm-data';

// ── Types ─────────────────────────────────────────────────────
type Mode = 'artist' | 'venue';
type Panel = 'primary' | 'secondary';
type Kind = 'venue' | 'artist' | 'cobill' | 'promoter';
type ReqStatus = 'sent' | 'hold' | 'confirmed' | 'declined' | null;
type Item = BMVenue | BMArtist | BMCobill | BMPromoter;
interface ReqState { status: ReqStatus; date: number; fee: string; msg: string; }

// ── Constants ─────────────────────────────────────────────────
const ACCENT = '#ff5029';
const W = { geo: 40, fit: 28, genre: 20, vel: 12 };
const C = {
  bg: '#0a0805', bg2: '#100d09', bg3: '#1a1612', bg4: '#221c16',
  ink: '#f0ebe5', ink2: '#9e9080', ink3: '#5a5048',
  line: 'rgba(255,255,255,.07)', line2: 'rgba(255,255,255,.15)',
  pink: '#ff3e9a', teal: '#22e5d4', purple: '#b983ff', amber: '#ffb84a',
  blue: '#7fb3ff',
};

const VERBS: Record<Kind, { cta: string; title: string; sent: string; send: string; toast: string; feeL: string; feePh: string; dateL: string }> = {
  venue:    { cta:'Request booking', title:'Request a booking',  sent:'REQUEST SENT',  send:'Send request',   toast:'Booking request sent to', feeL:'Your ask',    feePh:'e.g. $1,200 guarantee + 80/20 door',  dateL:'Proposed date' },
  artist:   { cta:'Invite to play',  title:'Invite to play',     sent:'INVITE SENT',   send:'Send invite',    toast:'Invite sent to',          feeL:'Your offer',  feePh:'e.g. $900 guarantee + door split',    dateL:'Proposed date' },
  cobill:   { cta:'Propose co-bill', title:'Propose a co-bill',  sent:'PROPOSAL SENT', send:'Send proposal',  toast:'Co-bill proposed to',     feeL:'Split',       feePh:'e.g. 60/40 headline split',           dateL:'Target date' },
  promoter: { cta:'Request lineup',  title:'Request a lineup',   sent:'REQUEST SENT',  send:'Send request',   toast:'Lineup request sent to',  feeL:'Budget',      feePh:'e.g. $3,500 talent budget',           dateL:'Target weekend' },
};
const STATUS_CFG: Record<Exclude<ReqStatus, null>, { cls: string; txt: string; banner: string }> = {
  sent:      { cls:'st-sent', txt:'● {SENT}',    banner:'Awaiting reply · sent just now' },
  hold:      { cls:'st-hold', txt:'◐ ON HOLD',   banner:'On hold — they\'re checking the date' },
  confirmed: { cls:'st-ok',   txt:'✓ CONFIRMED', banner:'Confirmed — date is locked in' },
  declined:  { cls:'st-no',   txt:'✕ DECLINED',  banner:'Declined — try another date or act' },
};
const TABS: Record<Mode, Array<[Panel, string]>> = {
  artist: [['primary','Venues'],['secondary','Co-bills']],
  venue:  [['primary','Artists'],['secondary','Promoters']],
};
const TITLES: Record<Mode, Record<Panel, string>> = {
  artist: { primary:'Venues to play',    secondary:'Acts to co-bill' },
  venue:  { primary:'Artists to book',   secondary:'Promoters to partner' },
};
const SNAP_NAMES = ['full','half','peek'] as const;
type SnapName = typeof SNAP_NAMES[number];

// ── Helpers ───────────────────────────────────────────────────
function sc(it: Item) { return scoreComp(it.comp, W); }
function fansAt(it: Item, rIdx: number) {
  const f = (it as BMVenue | BMArtist).fans;
  return f ? Math.round(f * FAN_SCALE[rIdx]) : 0;
}
function itemKind(mode: Mode, panel: Panel): Kind {
  if (mode === 'artist') return panel === 'secondary' ? 'cobill' : 'venue';
  return panel === 'secondary' ? 'promoter' : 'artist';
}
function getItems(mode: Mode, panel: Panel): Item[] {
  if (mode === 'artist') return panel === 'secondary' ? artist.cobills : artist.venues;
  return panel === 'secondary' ? venue.promoters : venue.artists;
}
function ranked(mode: Mode, panel: Panel, dateIdx: number): Item[] {
  let arr = getItems(mode, panel).slice();
  if (dateIdx > 0 && panel === 'primary') {
    arr = arr.filter(it => ((it as BMVenue | BMArtist).avail || []).includes(dateIdx));
  }
  return arr.sort((a, b) => sc(b) - sc(a));
}

// ── Chip grades ───────────────────────────────────────────────
function gradeChip(grade: Grade, extra?: string) {
  const cfg: Record<string, { bg: string; color: string; bd: string; label: string }> = {
    top:     { bg:'rgba(255,80,41,.13)',  color:ACCENT,  bd:'rgba(255,80,41,.3)',  label:'TOP' },
    good:    { bg:'rgba(34,229,212,.1)',  color:C.teal,  bd:'rgba(34,229,212,.3)', label:'GOOD' },
    caution: { bg:'rgba(255,184,74,.13)',color:C.amber, bd:'rgba(255,184,74,.3)', label:'SIZE' },
    played:  { bg:C.bg4,                 color:C.ink2,  bd:C.line2,               label:'PLAYED' },
  };
  const c = cfg[grade] || cfg.good;
  return (
    <span style={{ display:'inline-block', padding:'2px 6px', borderRadius:99, fontFamily:'"JetBrains Mono",monospace',
      fontSize:9, fontWeight:700, letterSpacing:'.1em', background:c.bg, color:c.color, border:`1px solid ${c.bd}`, marginLeft:4 }}>
      {extra || c.label}
    </span>
  );
}
function statusChip(status: string) {
  const m: Record<string,{bg:string;color:string;bd:string}> = {
    Spiking: { bg:'rgba(255,62,154,.14)', color:C.pink,   bd:'rgba(255,62,154,.34)' },
    Rising:  { bg:'rgba(34,229,212,.12)', color:C.teal,   bd:'rgba(34,229,212,.3)' },
    Steady:  { bg:C.bg4,                  color:C.ink2,   bd:C.line2 },
    Early:   { bg:'rgba(127,179,255,.1)', color:C.blue,   bd:'rgba(127,179,255,.3)' },
  };
  const c = m[status] || m.Steady;
  return (
    <span style={{ display:'inline-block', padding:'2px 6px', borderRadius:99, fontFamily:'"JetBrains Mono",monospace',
      fontSize:9, fontWeight:700, letterSpacing:'.1em', background:c.bg, color:c.color, border:`1px solid ${c.bd}`, marginLeft:4 }}>
      {status.toUpperCase()}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────
export function ViewMatchmaker() {
  // State
  const [mode, setModeState] = useState<Mode>('artist');
  const [panel, setPanelState] = useState<Panel>('primary');
  const [radiusIdx] = useState(1);
  const [dateIdx, setDateIdx] = useState(0);
  const [selId, setSelId] = useState<string | null>(null);
  const [expId, setExpId] = useState<string | null>(null);
  const [reqState, setReqState] = useState<Record<string, ReqState>>({});
  const [snap, setSnap] = useState<SnapName>('half');
  const [modalId, setModalId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const selGfxLayer = useRef<L.LayerGroup | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const baseMarker = useRef<L.Marker | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const leafletLoaded = useRef(false);

  // Drag state
  const dragRef = useRef({ dragging: false, startY: 0, startT: 0 });
  const snapsRef = useRef({ full: 0, half: 0, peek: 0 });

  // ── Derived ──
  const kind = useCallback(() => itemKind(mode, panel), [mode, panel]);
  const items = useCallback(() => getItems(mode, panel), [mode, panel]);
  const rankedItems = useCallback(() => ranked(mode, panel, dateIdx), [mode, panel, dateIdx]);
  const getReq = useCallback((id: string): ReqState =>
    reqState[id] || { status: null, date: 0, fee: '', msg: '' }, [reqState]);

  // ── Toast ──
  function showToast(msg: string) {
    setToastMsg(msg); setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  // ── Snap/sheet ──
  function computeSnaps() {
    const h = containerRef.current?.clientHeight || 700;
    snapsRef.current = { full: Math.round(h * 0.10), half: Math.round(h * 0.46), peek: h - 232 };
  }
  function applySnap(name: SnapName, animate = true) {
    const sheet = sheetRef.current; if (!sheet) return;
    computeSnaps();
    if (animate) sheet.style.transition = 'transform .32s cubic-bezier(.32,.72,0,1)';
    else sheet.style.transition = 'none';
    sheet.style.transform = `translateY(${snapsRef.current[name]}px)`;
    setSnap(name);
    setTimeout(() => { leafletMap.current?.invalidateSize(); }, 340);
  }

  // ── Leaflet init ──
  useEffect(() => {
    if (leafletLoaded.current) return;
    leafletLoaded.current = true;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet.heat from CDN
    const loadHeat = () => new Promise<void>(res => {
      if ((window as unknown as { HeatmapOverlay?: unknown }).HeatmapOverlay) { res(); return; }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      s.onload = () => res();
      s.onerror = () => res();
      document.head.appendChild(s);
    });

    import('leaflet').then(async (L) => {
      await loadHeat();
      if (!mapRef.current || leafletMap.current) return;

      const d = mode === 'artist' ? artist : venue;
      const map = L.map(mapRef.current, {
        center: d.center, zoom: d.zoom,
        zoomControl: false, attributionControl: false, zoomSnap: 0.5,
      });
      leafletMap.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 19, detectRetina: true,
      } as L.TileLayerOptions).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      selGfxLayer.current = L.layerGroup().addTo(map);

      computeSnaps();
      applySnap('half', false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render map when state changes ──
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    import('leaflet').then((L) => {
      renderHeat(L as typeof import('leaflet'), map);
      renderBase(L as typeof import('leaflet'), map);
      renderMapMarkers(L as typeof import('leaflet'));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;
    import('leaflet').then((L) => {
      renderMapMarkers(L as typeof import('leaflet'));
      drawSelGfx(L as typeof import('leaflet'));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, dateIdx, selId]);

  function renderHeat(L: typeof import('leaflet'), map: L.Map) {
    if (heatLayer.current) { map.removeLayer(heatLayer.current); heatLayer.current = null; }
    const d = mode === 'artist' ? artist : venue;
    const pts: [number, number, number][] = [];
    d.heat.forEach(([la, ln, w]) => {
      pts.push([la, ln, w]);
      for (let i = 0; i < 14; i++) {
        pts.push([la + (Math.random() - .5) * 0.013, ln + (Math.random() - .5) * 0.017, w * (0.28 + Math.random() * 0.5)]);
      }
    });
    const lAny = L as unknown as { heatLayer: (pts: unknown[], opts: unknown) => L.Layer };
    if (lAny.heatLayer) {
      heatLayer.current = lAny.heatLayer(pts, {
        radius: 18, blur: 17, max: 1.1, minOpacity: 0.12,
        gradient: { 0.2: 'rgba(255,62,154,0)', 0.4: '#ff3e9a', 0.72: ACCENT, 1: '#ffe6dd' },
      }).addTo(map);
    }
  }

  function renderBase(L: typeof import('leaflet'), map: L.Map) {
    if (baseMarker.current) map.removeLayer(baseMarker.current);
    const b = mode === 'artist' ? artist.home : venue.loc;
    baseMarker.current = L.marker([b.lat, b.lng], {
      interactive: false, zIndexOffset: 600,
      icon: L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:${ACCENT};border-radius:50%;border:2px solid rgba(255,255,255,.8);box-shadow:0 0 8px ${ACCENT}88"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      }),
    }).addTo(map);
  }

  function renderMapMarkers(L: typeof import('leaflet')) {
    markersLayer.current?.clearLayers();
    markerRefs.current = {};
    const arr = rankedItems();
    arr.forEach((it, i) => {
      const g = (it as { grade?: Grade }).grade || 'good';
      const pinColor = g === 'top' ? ACCENT : g === 'good' ? C.amber : g === 'played' ? C.ink3 : C.ink3;
      const isSel = selId === it.id;
      const marker = L.marker([it.lat, it.lng], {
        riseOnHover: true, zIndexOffset: g === 'top' ? 200 : 100,
        icon: L.divIcon({
          className: '',
          iconSize: [28, 32], iconAnchor: [14, 32],
          html: `<div style="position:relative;width:28px;height:32px">
            <svg viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0">
              <path d="M14 1C7.4 1 2 6.4 2 13c0 8.6 12 18 12 18s12-9.4 12-18c0-6.6-5.4-12-12-12Z"
                fill="${pinColor}" stroke="${isSel ? '#fff' : 'rgba(255,255,255,.4)'}" stroke-width="${isSel ? 2 : 1}"/>
            </svg>
            <span style="position:absolute;left:0;right:0;top:4px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:${C.bg};line-height:1">${i + 1}</span>
          </div>`,
        }),
      });
      marker.on('click', () => {
        setSelId(it.id); setExpId(it.id); applySnap('half');
      });
      marker.addTo(markersLayer.current!);
      markerRefs.current[it.id] = marker;
    });
  }

  function drawSelGfx(L: typeof import('leaflet')) {
    selGfxLayer.current?.clearLayers();
    if (!selId) return;
    const arr = rankedItems();
    const it = arr.find(v => v.id === selId);
    if (!it) return;
    const k = kind();
    if (k === 'venue') {
      L.circle([it.lat, it.lng], {
        radius: RADIUS_M[radiusIdx], color: ACCENT, weight: 1.5,
        dashArray: '6 6', fillColor: ACCENT, fillOpacity: 0.07, interactive: false,
      }).addTo(selGfxLayer.current!);
    } else {
      const b = mode === 'artist' ? artist.home : venue.loc;
      L.polyline([[b.lat, b.lng], [it.lat, it.lng]], {
        color: ACCENT, weight: 2, dashArray: '2 6', opacity: .9, interactive: false,
      }).addTo(selGfxLayer.current!);
      L.circle([it.lat, it.lng], {
        radius: 1100, color: ACCENT, weight: 1.5, fillColor: ACCENT, fillOpacity: 0.08, interactive: false,
      }).addTo(selGfxLayer.current!);
    }
  }

  // ── Mode/panel switches ──
  function switchMode(m: Mode) {
    if (m === mode) return;
    setModeState(m); setPanelState('primary'); setSelId(null); setExpId(null); setDateIdx(0);
    selGfxLayer.current?.clearLayers();
    const d = m === 'artist' ? artist : venue;
    leafletMap.current?.setView(d.center, d.zoom, { animate: true });
  }
  function switchPanel(p: Panel) {
    if (p === panel) return;
    setPanelState(p); setSelId(null); setExpId(null); setDateIdx(0);
    selGfxLayer.current?.clearLayers();
  }

  // ── Stats helpers ──
  function getStats(it: Item): [string, string][] {
    const k = kind();
    if (k === 'venue') { const v = it as BMVenue; return [[fansAt(v,radiusIdx).toLocaleString(),`FANS·${RADII[radiusIdx]}MI`],[Math.round(v.fit*100)+'%','FIT'],['▲'+v.vel+'%','VEL']]; }
    if (k === 'artist') { const a = it as BMArtist; return [[fansAt(a,radiusIdx).toLocaleString(),'HYPERS'],[Math.round(a.fit*100)+'%','FIT'],['▲'+a.vel+'%','VEL']]; }
    if (k === 'cobill') { const c = it as BMCobill; return [[c.overlap+'%','OVERLAP'],[c.draw.toLocaleString(),'DRAW'],['▲'+c.lift+'%','LIFT']]; }
    const p = it as BMPromoter; return [[p.match+'%','LINEUP'],[p.shows.toString(),'SHOWS'],[Math.round(p.sell*100)+'%','SELL']];
  }
  function getMeta(it: Item): string {
    const k = kind();
    if (k === 'venue') { const v = it as BMVenue; return `${v.hood} · ${v.cap.toLocaleString()} cap`; }
    if (k === 'artist' || k === 'cobill') { const a = it as BMArtist | BMCobill; return `${a.genre} · ${a.hood}`; }
    const p = it as BMPromoter; return `${p.kind} · ${p.hood}`;
  }

  // ── Action label ──
  function actionLabel(it: Item): { txt: string; cls: string } {
    const s = getReq(it.id);
    const k = kind();
    if (!s.status) return { txt: VERBS[k].cta, cls: '' };
    const c = STATUS_CFG[s.status];
    return { txt: c.txt.replace('{SENT}', VERBS[k].sent), cls: c.cls };
  }

  // ── Reach ──
  function reachValue(): { val: string; label: string } {
    const arr = rankedItems();
    if (panel === 'secondary') {
      if (kind() === 'cobill') {
        const v = (arr as BMCobill[]).reduce((s, a) => s + Math.round(a.draw * (1 - a.overlap / 100)), 0);
        return { val: v.toLocaleString(), label: 'net-new' };
      }
      const v = (arr as BMPromoter[]).reduce((s, p) => s + p.shows, 0);
      return { val: v.toLocaleString(), label: 'shows' };
    }
    const v = arr.reduce((s, it) => s + fansAt(it, radiusIdx), 0);
    return { val: v.toLocaleString(), label: 'reach' };
  }

  // ── Modal ──
  const [modalData, setModalData] = useState<{
    it: Item; curDate: number; fee: string; msg: string;
  } | null>(null);

  function templateMsg(it: Item, date: number): string {
    const A = artist.name, V = venue.name;
    const dt = DATES[date]?.full || 'a date that works';
    const k = kind();
    if (k === 'venue') { const v = it as BMVenue; return `Hi ${v.name} team — I'm ${A} (alt-R&B, Logan Square). ${fansAt(v,radiusIdx)} of my listeners are within ${RADII[radiusIdx]} mi of you, and I'd love to headline ${dt}. Draw fits your ${v.cap}-cap room. Open to talk?`; }
    if (k === 'artist') { const a = it as BMArtist; return `Hi ${a.name} — ${V} (400-cap, Ukrainian Village) here. You're trending in our catchment (${fansAt(a,radiusIdx)} local hypers, ▲${a.vel}%) and we'd love to have you ${dt}. Lock a date?`; }
    if (k === 'cobill') { const c = it as BMCobill; return `Hey ${c.name} — ${A} here. Our crowds only overlap ~${c.overlap}%, so we'd each bring new heads. Co-headline ${dt}? Could lift both bills ~${c.lift}%.`; }
    const p = it as BMPromoter; return `Hi ${p.name} — ${V} here. Your roster is a ${p.match}% match for our room (${Math.round(p.sell*100)}% avg sell-through). Co-promote a lineup ${dt}?`;
  }

  function openModal(id: string) {
    const arr = [...items()];
    const it = arr.find(v => v.id === id); if (!it) return;
    const s = getReq(id);
    const avail = panel === 'primary' ? ((it as BMVenue | BMArtist).avail || []) : DATES.map((_,i)=>i).filter(i=>i>0);
    const curDate = s.date || (dateIdx > 0 ? dateIdx : (avail[0] || 0));
    setModalData({ it, curDate, fee: s.fee, msg: s.msg || templateMsg(it, curDate) });
    setModalId(id);
  }

  function closeModal() { setModalId(null); setModalData(null); }

  function sendOrWithdraw() {
    if (!modalId || !modalData) return;
    const { it, curDate, fee, msg } = modalData;
    const s = getReq(modalId);
    const k = kind();
    if (s.status) {
      setReqState(prev => ({ ...prev, [modalId]: { status: null, date: 0, fee: '', msg: '' } }));
      closeModal();
      showToast(`Request to ${it.name} withdrawn`);
      return;
    }
    setReqState(prev => ({ ...prev, [modalId]: { status: 'sent', date: curDate, fee, msg } }));
    closeModal();
    showToast(`${VERBS[k].toast} ${it.name}`);
    scheduleReply(modalId, it);
  }

  function scheduleReply(id: string, it: Item) {
    const grade = (it as { grade?: Grade }).grade || 'good';
    const odds: Record<string, [number, number]> = { top:[0.7,0.95], good:[0.45,0.85], caution:[0.2,0.65], played:[0.6,0.9] };
    const [lo, hi] = odds[grade] || [0.5, 0.85];
    setTimeout(() => {
      setReqState(prev => {
        const s = prev[id]; if (!s || s.status !== 'sent') return prev;
        const r = Math.random();
        const newStatus: ReqStatus = r < lo ? 'confirmed' : r < hi ? 'hold' : 'declined';
        const verb = { confirmed:'confirmed', hold:'put a hold for', declined:'passed on' }[newStatus] || 'replied to';
        const d = DATES[s.date]?.short;
        showToast(`${it.name} ${verb} ${newStatus === 'declined' ? 'your request' : d || 'your date'}`);
        return { ...prev, [id]: { ...s, status: newStatus } };
      });
    }, 2400 + Math.random() * 1600);
  }

  // ── Sheet drag ──
  function onGrabDown(e: React.MouseEvent | React.TouchEvent) {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const sheet = sheetRef.current; if (!sheet) return;
    const m = /translateY\(([-\d.]+)px\)/.exec(sheet.style.transform);
    dragRef.current = { dragging: true, startY: y, startT: m ? parseFloat(m[1]) : snapsRef.current.half };
    sheet.style.transition = 'none';
  }
  function onGrabMove(e: React.MouseEvent | React.TouchEvent) {
    if (!dragRef.current.dragging) return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const { startY, startT } = dragRef.current;
    const { full, peek } = snapsRef.current;
    const t = Math.max(full - 20, Math.min(peek + 40, startT + (y - startY)));
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${t}px)`;
  }
  function onGrabUp() {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const sheet = sheetRef.current; if (!sheet) return;
    const m = /translateY\(([-\d.]+)px\)/.exec(sheet.style.transform);
    const t = m ? parseFloat(m[1]) : snapsRef.current.half;
    let best: SnapName = 'half', bd = 1e9;
    SNAP_NAMES.forEach(n => { const d = Math.abs(snapsRef.current[n] - t); if (d < bd) { bd = d; best = n; } });
    applySnap(best);
  }
  function onGrabClick() { if (snap !== 'full') applySnap('full'); }

  // ── Date picker ──
  const reach = reachValue();
  const arr = rankedItems();
  const countLabel = panel === 'secondary'
    ? `${arr.length} ${kind() === 'cobill' ? 'acts' : 'promoters'}`
    : `${arr.length} ${kind() === 'venue' ? 'venues' : 'artists'}${dateIdx > 0 ? ' · ' + DATES[dateIdx].short : ''}`;

  // ── Modal context tiles ──
  function ctxTiles(it: Item) {
    const k = kind();
    const tiles: [string, string, string][] = [[String(sc(it)),'MATCH',ACCENT]];
    if (k === 'venue') { const v = it as BMVenue; tiles.push([fansAt(v,radiusIdx).toLocaleString(),`FANS·${RADII[radiusIdx]}MI`,C.pink],[v.cap.toLocaleString(),'CAP',C.ink]); }
    else if (k === 'artist') { const a = it as BMArtist; tiles.push([fansAt(a,radiusIdx).toLocaleString(),'HYPERS',C.pink],['▲'+a.vel+'%','VEL',C.teal]); }
    else if (k === 'cobill') { const c = it as BMCobill; tiles.push([c.overlap+'%','OVERLAP',C.pink],['▲'+c.lift+'%','LIFT',C.teal]); }
    else { const p = it as BMPromoter; tiles.push([p.match+'%','LINEUP',C.pink],[Math.round(p.sell*100)+'%','SELL',C.teal]); }
    return tiles;
  }

  const modalOpen = modalId !== null && modalData !== null;
  const modalSent = modalOpen && !!getReq(modalId!).status;

  return (
    <>
      <style>{BM_STYLES}</style>
      <div
        ref={containerRef}
        className="bm-container"
        onMouseMove={onGrabMove}
        onMouseUp={onGrabUp}
        onTouchMove={onGrabMove}
        onTouchEnd={onGrabUp}
      >
        {/* Map */}
        <div ref={mapRef} id="bm-map" />

        {/* Top bar */}
        <div className="bm-top">
          <button className="bm-role" onClick={() => switchMode(mode === 'artist' ? 'venue' : 'artist')}>
            <span className="bm-role-ic" style={{
              background: mode === 'artist' ? 'linear-gradient(135deg,#ff3e9a,#ff5029)' : 'linear-gradient(135deg,#22e5d4,#7fb3ff)',
            }}>{mode === 'artist' ? 'A' : 'V'}</span>
            <span className="bm-role-txt">
              <b>{mode === 'artist' ? 'Artist' : 'Venue'}</b>
              <small>{mode === 'artist' ? 'Jordan Nore · Logan Sq' : 'Empty Bottle · 400 cap'}</small>
            </span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M7 4L3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="bm-reach" onClick={() => applySnap(snap === 'peek' ? 'half' : 'peek')}>
            <b>{reach.val}</b><span>{reach.label}</span>
          </button>
        </div>

        {/* Bottom sheet */}
        <div className="bm-sheet" ref={sheetRef}>
          {/* Grab zone */}
          <div
            className="bm-grabzone"
            onMouseDown={onGrabDown}
            onTouchStart={onGrabDown}
            onClick={onGrabClick}
          >
            <div className="bm-grab" />
          </div>

          {/* Sheet header */}
          <div className="bm-sheet-head">
            <div className="bm-sheet-title">
              <b>{TITLES[mode][panel]}</b>
              <span>{countLabel}</span>
            </div>
            <div className="bm-tabs">
              {TABS[mode].map(([p, label]) => (
                <button key={p} className={`bm-tab${p === panel ? ' on' : ''}`} onClick={() => switchPanel(p)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date strip */}
          {panel === 'primary' && (
            <div className="bm-datewrap">
              <div className="bm-dates">
                {DATES.map((d, i) => (
                  <button
                    key={i}
                    className={`bm-date${i === dateIdx ? ' on' : ''}${i === 0 ? ' any' : ''}`}
                    onClick={() => { setDateIdx(i); setSelId(null); setExpId(null); selGfxLayer.current?.clearLayers(); }}
                  >{d.short}</button>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          <div className="bm-list">
            {arr.map((it, i) => {
              const open = expId === it.id;
              const sel = selId === it.id;
              const stats = getStats(it);
              const meta = getMeta(it);
              const act = actionLabel(it);
              const grade = (it as { grade?: Grade }).grade || 'good';
              const av = dateIdx > 0 && panel === 'primary';
              const k = kind();

              return (
                <div
                  key={it.id}
                  className={`bm-card${grade === 'top' ? ' top' : ''}${sel ? ' sel' : ''}${open ? ' open' : ''}`}
                >
                  {/* Card row (tap to expand) */}
                  <div
                    className="bm-card-row"
                    onClick={() => {
                      const newOpen = !open;
                      setExpId(newOpen ? it.id : null);
                      setSelId(it.id);
                      if (newOpen) {
                        const item = rankedItems().find(v => v.id === it.id);
                        if (item && leafletMap.current) {
                          leafletMap.current.panTo([item.lat - 0.018, item.lng], { animate: true });
                        }
                        import('leaflet').then(L => drawSelGfx(L as typeof import('leaflet')));
                      }
                    }}
                  >
                    <div className="bm-rank">{i + 1}</div>
                    <div className="bm-cmain">
                      <div className="bm-cname">
                        {it.name}
                        {k === 'artist' && (it as BMArtist).status && !((it as BMArtist).played) && statusChip((it as BMArtist).status)}
                        {((it as BMVenue | BMArtist).played) && gradeChip('played')}
                        {grade === 'caution' && !((it as BMVenue | BMArtist).played) && gradeChip('caution', 'SIZE')}
                        {av && <span className="bm-avail-chip">FREE {DATES[dateIdx].short}</span>}
                      </div>
                      <div className="bm-cmeta">{meta}</div>
                    </div>
                    <div className="bm-cmatch">
                      <b>{sc(it)}</b>
                      <span>MATCH</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="bm-cstats">
                    {stats.map(([val, label]) => (
                      <div key={label}><b>{val}</b><span>{label}</span></div>
                    ))}
                  </div>

                  {/* Expandable body */}
                  <div className="bm-cbody">
                    <div className="bm-creason" dangerouslySetInnerHTML={{ __html: it.reason }} />
                    <BrkBar label="Local demand" val={it.comp.geo} color={C.pink} />
                    <BrkBar label="Fit" val={it.comp.fit} color={C.teal} />
                    <BrkBar label="Genre" val={it.comp.genre} color={C.purple} />
                    <BrkBar label="Velocity" val={it.comp.vel} color={C.amber} />
                    <div className="bm-audit"><b>Audit</b> {it.audit}</div>
                    <button
                      className={`bm-book ${act.cls}`}
                      onClick={e => { e.stopPropagation(); openModal(it.id); }}
                    >{act.txt}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compose modal */}
        {modalOpen && modalData && (
          <div className="bm-modal show">
            <div className="bm-mm-head">
              <button className="bm-mm-x" onClick={closeModal}>Cancel</button>
              <div className="bm-mm-ht">
                <b>{modalSent ? modalData.it.name : VERBS[kind()].title}</b>
                <small>{modalSent ? `${VERBS[kind()].title} · ${getMeta(modalData.it)}` : getMeta(modalData.it)}</small>
              </div>
              <span style={{ width: 54 }} />
            </div>
            <div className="bm-mm-body">
              {/* Context tiles */}
              <div className="bm-mm-ctx">
                {ctxTiles(modalData.it).map(([val, label, color]) => (
                  <div key={label} className="bm-ctx-t">
                    <b style={{ color }}>{val}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Status banner */}
              {modalSent && (
                <div className={`bm-mm-status ${STATUS_CFG[getReq(modalId!).status!]?.cls}`}>
                  {STATUS_CFG[getReq(modalId!).status!]?.banner}
                </div>
              )}

              {/* Date picker */}
              <div className="bm-mm-field">
                <label>{VERBS[kind()].dateL}</label>
                <div className="bm-dates wrap">
                  {(panel === 'primary'
                    ? ((modalData.it as BMVenue | BMArtist).avail || [])
                    : DATES.map((_,i)=>i).filter(i=>i>0)
                  ).map(i => (
                    <button
                      key={i}
                      className={`bm-date${i === modalData.curDate ? ' on' : ''}`}
                      disabled={modalSent}
                      onClick={() => {
                        if (modalSent) return;
                        setModalData(prev => prev ? { ...prev, curDate: i, msg: prev.msg || templateMsg(prev.it, i) } : prev);
                      }}
                    >{DATES[i].short}</button>
                  ))}
                </div>
              </div>

              {/* Fee */}
              <div className="bm-mm-field">
                <label>{VERBS[kind()].feeL}</label>
                <input
                  className="bm-mm-input"
                  placeholder={VERBS[kind()].feePh}
                  value={modalData.fee}
                  readOnly={modalSent}
                  onChange={e => setModalData(prev => prev ? { ...prev, fee: e.target.value } : prev)}
                />
              </div>

              {/* Message */}
              <div className="bm-mm-field">
                <label>Message</label>
                <textarea
                  className="bm-mm-input"
                  rows={5}
                  value={modalData.msg}
                  readOnly={modalSent}
                  onChange={e => setModalData(prev => prev ? { ...prev, msg: e.target.value } : prev)}
                />
                {!modalSent && <div className="bm-hint">Pre-filled from your match data — edit freely.</div>}
              </div>
            </div>
            <div className="bm-mm-foot">
              <button
                className={`bm-mm-send${modalSent ? ' withdraw' : ''}`}
                onClick={sendOrWithdraw}
              >{modalSent ? 'Withdraw request' : VERBS[kind()].send}</button>
            </div>
          </div>
        )}

        {/* Toast */}
        <div className={`bm-toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>
      </div>
    </>
  );
}

// ── BrkBar sub-component ──────────────────────────────────────
function BrkBar({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div className="bm-brk">
      <div className="bm-brk-t">
        <span>{label}</span><b>{val}</b>
      </div>
      <div className="bm-brk-b">
        <i style={{ width: `${val}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const BM_STYLES = `
/* ── Leaflet icon fix ── */
.leaflet-default-icon-path { display: none; }

/* ── Container ── */
.bm-container {
  position: absolute; inset: 0;
  background: #0a0805;
  font-family: "DM Sans", sans-serif;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

/* ── Map ── */
#bm-map {
  position: absolute; inset: 0;
  z-index: 0;
}

/* ── Top bar ── */
.bm-top {
  position: absolute; top: 0; left: 0; right: 0;
  z-index: 20;
  padding: 10px 14px;
  display: flex; align-items: center; gap: 10px;
  background: rgba(16,13,9,.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.bm-role {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 11px; border-radius: 10px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
  color: #f0ebe5; cursor: pointer; min-height: 0;
}
.bm-role-ic {
  width: 22px; height: 22px; border-radius: 6px;
  font-family: "Syne", sans-serif; font-size: 11px; font-weight: 800;
  color: #0a0805; display: flex; align-items: center; justify-content: center;
}
.bm-role-txt { display: flex; flex-direction: column; align-items: flex-start; }
.bm-role-txt b { font-family: "Syne", sans-serif; font-size: 13px; font-weight: 700; color: #f0ebe5; }
.bm-role-txt small { font-family: "JetBrains Mono", monospace; font-size: 9px; color: #9e9080; letter-spacing: .06em; margin-top: 1px; }
.bm-reach {
  margin-left: auto; display: flex; flex-direction: column; align-items: flex-end;
  padding: 6px 10px; border-radius: 10px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.10);
  cursor: pointer; min-height: 0;
}
.bm-reach b { font-family: "Syne", sans-serif; font-size: 16px; font-weight: 800; color: ${ACCENT}; line-height: 1; }
.bm-reach span { font-family: "JetBrains Mono", monospace; font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #9e9080; margin-top: 1px; }

/* ── Sheet ── */
.bm-sheet {
  position: absolute; left: 0; right: 0; bottom: 0;
  z-index: 10;
  background: rgba(16,13,9,.93);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,.1);
  border-radius: 18px 18px 0 0;
  display: flex; flex-direction: column;
  min-height: 232px;
  /* height managed by translateY */
  top: 0;
}
.bm-grabzone {
  padding: 10px 0 6px; cursor: grab; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.bm-grabzone:active { cursor: grabbing; }
.bm-grab {
  width: 38px; height: 5px; border-radius: 99px;
  background: rgba(255,255,255,.2);
}

/* ── Sheet header ── */
.bm-sheet-head {
  padding: 0 14px 10px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.bm-sheet-title { display: flex; flex-direction: column; gap: 2px; }
.bm-sheet-title b { font-family: "Syne", sans-serif; font-size: 15px; font-weight: 700; color: #f0ebe5; }
.bm-sheet-title span { font-family: "JetBrains Mono", monospace; font-size: 10px; color: #9e9080; letter-spacing: .06em; }
.bm-tabs { display: flex; gap: 4px; }
.bm-tab {
  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1);
  font-family: "JetBrains Mono", monospace; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  background: transparent; color: #9e9080; cursor: pointer; min-height: 0;
  transition: background .15s, color .15s, border-color .15s;
}
.bm-tab.on { background: ${ACCENT}; color: #0a0805; border-color: ${ACCENT}; }

/* ── Date strip ── */
.bm-datewrap { padding: 10px 14px 4px; flex-shrink: 0; }
.bm-dates { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.bm-dates::-webkit-scrollbar { display: none; }
.bm-date {
  padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1);
  font-family: "JetBrains Mono", monospace; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  background: rgba(255,255,255,.04); color: #9e9080; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; min-height: 0; transition: background .15s, color .15s;
}
.bm-date.on { background: ${ACCENT}; color: #0a0805; border-color: ${ACCENT}; }
.bm-date.any { background: transparent; }
.bm-dates.wrap { flex-wrap: wrap; overflow-x: visible; }

/* ── List ── */
.bm-list { flex: 1; overflow-y: auto; padding: 8px 0 60px; scrollbar-width: none; }
.bm-list::-webkit-scrollbar { display: none; }

/* ── Card ── */
.bm-card {
  margin: 0 10px 8px; border-radius: 12px;
  background: rgba(26,22,18,.8); border: 1px solid rgba(255,255,255,.07);
  overflow: hidden; transition: border-color .15s;
}
.bm-card.sel { border-color: rgba(255,255,255,.2); }
.bm-card-row {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 12px 10px; cursor: pointer;
}
.bm-rank {
  width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
  background: rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center;
  font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700; color: #9e9080;
}
.bm-card.top .bm-rank { background: rgba(255,80,41,.15); color: ${ACCENT}; }
.bm-cmain { flex: 1; min-width: 0; }
.bm-cname { font-family: "Syne", sans-serif; font-size: 14px; font-weight: 700; color: #f0ebe5; display: flex; align-items: center; flex-wrap: wrap; gap: 3px; line-height: 1.2; }
.bm-cmeta { font-family: "JetBrains Mono", monospace; font-size: 9.5px; color: #9e9080; letter-spacing: .06em; margin-top: 3px; }
.bm-cmatch { text-align: right; flex-shrink: 0; }
.bm-cmatch b { font-family: "Syne", sans-serif; font-size: 22px; font-weight: 800; color: #9e9080; line-height: 1; display: block; }
.bm-card.top .bm-cmatch b { color: ${ACCENT}; }
.bm-cmatch span { font-family: "JetBrains Mono", monospace; font-size: 7px; font-weight: 700; letter-spacing: .14em; color: #5a5048; }

/* ── Card stats ── */
.bm-cstats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid rgba(255,255,255,.06);
  padding: 0;
}
.bm-cstats > div {
  display: flex; flex-direction: column; align-items: center; padding: 8px 4px;
  border-right: 1px solid rgba(255,255,255,.06);
}
.bm-cstats > div:last-child { border-right: none; }
.bm-cstats b { font-family: "Syne", sans-serif; font-size: 13px; font-weight: 700; color: #f0ebe5; }
.bm-cstats span { font-family: "JetBrains Mono", monospace; font-size: 8px; color: #5a5048; letter-spacing: .1em; margin-top: 2px; }

/* ── Card expandable body ── */
.bm-cbody {
  max-height: 0; overflow: hidden; padding: 0 12px;
  transition: max-height .3s cubic-bezier(.4,0,.2,1);
}
.bm-card.open .bm-cbody { max-height: 520px; padding-bottom: 12px; }
.bm-creason { font-family: "DM Sans", sans-serif; font-size: 13px; color: #9e9080; line-height: 1.5; padding: 12px 0 8px; }
.bm-creason b { color: #f0ebe5; }

/* ── Breakdown bars ── */
.bm-brk { margin-bottom: 7px; }
.bm-brk-t { display: flex; justify-content: space-between; font-family: "JetBrains Mono", monospace; font-size: 10px; color: #9e9080; margin-bottom: 4px; }
.bm-brk-t b { color: #f0ebe5; }
.bm-brk-b { height: 3px; background: rgba(255,255,255,.06); border-radius: 99px; overflow: hidden; }
.bm-brk-b i { display: block; height: 100%; border-radius: 99px; }

/* ── Audit ── */
.bm-audit { font-family: "DM Sans", sans-serif; font-size: 11px; color: #5a5048; line-height: 1.45; margin: 8px 0 12px; }
.bm-audit b { color: #9e9080; margin-right: 4px; font-family: "JetBrains Mono", monospace; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }

/* ── Book button ── */
.bm-book {
  width: 100%; padding: 13px; border-radius: 10px;
  font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  background: ${ACCENT}; color: #0a0805; border: none; cursor: pointer; min-height: 0;
  transition: opacity .15s;
}
.bm-book:active { opacity: .8; }
.bm-book.st-sent { background: rgba(255,184,74,.15); color: #ffb84a; border: 1px solid rgba(255,184,74,.3); }
.bm-book.st-hold { background: rgba(127,179,255,.1); color: #7fb3ff; border: 1px solid rgba(127,179,255,.3); }
.bm-book.st-ok   { background: rgba(34,229,212,.1);  color: #22e5d4; border: 1px solid rgba(34,229,212,.3); }
.bm-book.st-no   { background: rgba(255,255,255,.05); color: #5a5048; border: 1px solid rgba(255,255,255,.1); }

/* ── Availability chip ── */
.bm-avail-chip {
  display: inline-block; padding: 2px 6px; border-radius: 99px;
  font-family: "JetBrains Mono", monospace; font-size: 9px; font-weight: 700; letter-spacing: .1em;
  background: rgba(34,229,212,.12); color: #22e5d4; border: 1px solid rgba(34,229,212,.32);
}

/* ── Modal ── */
.bm-modal {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(10,8,5,.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex; flex-direction: column;
  transform: translateY(100%);
  transition: transform .35s cubic-bezier(.32,.72,0,1);
  overflow: hidden;
}
.bm-modal.show { transform: translateY(0); }
.bm-mm-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  flex-shrink: 0;
}
.bm-mm-x {
  font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700;
  color: #ff3e9a; background: transparent; border: none; cursor: pointer;
  padding: 6px; min-height: 0;
}
.bm-mm-ht { text-align: center; }
.bm-mm-ht b { font-family: "Syne", sans-serif; font-size: 15px; font-weight: 700; color: #f0ebe5; display: block; }
.bm-mm-ht small { font-family: "JetBrains Mono", monospace; font-size: 9px; color: #9e9080; letter-spacing: .06em; }
.bm-mm-body { flex: 1; overflow-y: auto; padding: 16px; scrollbar-width: none; }
.bm-mm-body::-webkit-scrollbar { display: none; }
.bm-mm-ctx { display: flex; gap: 8px; margin-bottom: 16px; }
.bm-ctx-t {
  flex: 1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 10px 8px; text-align: center;
}
.bm-ctx-t b { font-family: "Syne", sans-serif; font-size: 18px; font-weight: 800; display: block; margin-bottom: 3px; line-height: 1; }
.bm-ctx-t span { font-family: "JetBrains Mono", monospace; font-size: 8px; color: #9e9080; letter-spacing: .1em; }
.bm-mm-status {
  padding: 10px 14px; border-radius: 10px; margin-bottom: 14px;
  font-family: "JetBrains Mono", monospace; font-size: 11px; font-weight: 700; letter-spacing: .08em;
  text-align: center;
}
.bm-mm-status.st-sent { background: rgba(255,184,74,.12); color: #ffb84a; border: 1px solid rgba(255,184,74,.25); }
.bm-mm-status.st-hold { background: rgba(127,179,255,.1); color: #7fb3ff; border: 1px solid rgba(127,179,255,.25); }
.bm-mm-status.st-ok   { background: rgba(34,229,212,.1);  color: #22e5d4; border: 1px solid rgba(34,229,212,.25); }
.bm-mm-status.st-no   { background: rgba(255,255,255,.05); color: #5a5048; border: 1px solid rgba(255,255,255,.1); }
.bm-mm-field { margin-bottom: 14px; }
.bm-mm-field label {
  display: block; font-family: "JetBrains Mono", monospace; font-size: 10px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: #9e9080; margin-bottom: 8px;
}
.bm-mm-input {
  width: 100%; box-sizing: border-box;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px; padding: 12px; color: #f0ebe5;
  font-family: "DM Sans", sans-serif; font-size: 14px; resize: none;
}
.bm-mm-input:focus { outline: 2px solid ${ACCENT}; border-color: transparent; }
.bm-mm-input[readonly] { color: #9e9080; }
.bm-hint { font-family: "DM Sans", sans-serif; font-size: 12px; color: #5a5048; margin-top: 6px; font-style: italic; }
.bm-mm-foot {
  padding: 12px 16px 20px; flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,.08);
}
.bm-mm-send {
  width: 100%; padding: 16px; border-radius: 12px;
  font-family: "JetBrains Mono", monospace; font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  background: ${ACCENT}; color: #0a0805; border: none; cursor: pointer; min-height: 0;
  transition: opacity .15s;
}
.bm-mm-send:active { opacity: .8; }
.bm-mm-send.withdraw { background: rgba(255,255,255,.06); color: #9e9080; border: 1px solid rgba(255,255,255,.1); }

/* ── Toast ── */
.bm-toast {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(12px);
  z-index: 60; background: rgba(26,22,18,.96); border: 1px solid rgba(34,229,212,.3);
  border-radius: 10px; padding: 10px 16px;
  font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 600; color: #22e5d4;
  white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity .2s, transform .2s;
}
.bm-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── Leaflet map tile brightness ── */
.leaflet-tile-pane { filter: brightness(1.28) contrast(1.04) saturate(.9); }
`;
