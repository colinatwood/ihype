'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkbenchData } from '@/components/WorkbenchShellV2';

// ── TYPES ──────────────────────────────────────────────────────────────────
type Role = 'artist' | 'venue' | 'promoter' | 'fan';
type Device = 'desktop' | 'mobile';
type FontKey = 'editorial' | 'grotesk' | 'serif' | 'mono';
type LayoutKey = 'spotlight' | 'zine' | 'poster' | 'gallery';
type MoodKey = 'dark' | 'light';

interface Palette { bg: string; surface: string; line: string; ink: string; ink2: string; accent: string; accent2: string; }
interface Theme { name: string; mood: MoodKey; font: FontKey; layout: LayoutKey; palette: Palette; tagline: string | null; bio: string | null; radius: number; heroUrl?: string; }
interface FontDef { name: string; display: string; body: string; label: string; accent: string; dWeight: number; tight: string; }
interface SectionItem { t: string; m: string; }
interface Section { kind: 'tracks' | 'shows' | 'about'; title: string; items: SectionItem[]; }
interface RoleHero { kicker: string; stat: string; statLabel: string; cta: string; }
interface RoleDef { label: string; defaultName: string; defaultVibe: string; hero: RoleHero; tagline: string; bio: string; sections: Section[]; }
interface Content { name: string; tagline: string; bio: string; hero: RoleHero; sections: Section[]; defaultVibe: string; }
interface Look { id: string; name: string; mood: MoodKey; font: FontKey; layout: LayoutKey; kw: string[]; palette: Palette; }

type ChatMsg =
  | { id: string; type: 'ai'; html: string }
  | { id: string; type: 'user'; text: string }
  | { id: string; type: 'sys'; text: string }
  | { id: string; type: 'chips'; kind: 'role' | 'genre' | 'stage' | 'vibe'; chips: { value: string; label: string }[]; answered?: string }
  | { id: string; type: 'dirs' };

// ── DATA ───────────────────────────────────────────────────────────────────
const FONTS: Record<FontKey, FontDef> = {
  editorial: { name: 'Editorial',  display: "'Syne', sans-serif",                body: "'DM Sans', sans-serif",      label: "'JetBrains Mono', monospace", accent: "'Instrument Serif', serif",          dWeight: 800, tight: '-.03em' },
  grotesk:   { name: 'Grotesk',    display: "'Bricolage Grotesque', sans-serif", body: "'Space Grotesk', sans-serif",label: "'Space Grotesk', sans-serif",  accent: "'Bricolage Grotesque', sans-serif",  dWeight: 800, tight: '-.04em' },
  serif:     { name: 'Serif',      display: "'Instrument Serif', serif",         body: "'DM Sans', sans-serif",      label: "'JetBrains Mono', monospace", accent: "'Instrument Serif', serif",          dWeight: 400, tight: '-.01em' },
  mono:      { name: 'Mono',       display: "'Space Grotesk', sans-serif",       body: "'DM Sans', sans-serif",      label: "'JetBrains Mono', monospace", accent: "'JetBrains Mono', monospace",        dWeight: 700, tight: '-.02em' },
};

const LAYOUTS: LayoutKey[] = ['spotlight', 'zine', 'poster', 'gallery'];

const LOOKS: Look[] = [
  { id:'velvet',    name:'Midnight Velvet',    mood:'dark',  font:'editorial', layout:'spotlight', kw:['moody','night','r&b','soul','smooth','dark','sultry','velvet','jazz','slow'],          palette:{bg:'#0b0712',surface:'#171022',line:'#2a2036',ink:'#f4eefc',ink2:'#bda9da',accent:'#b983ff',accent2:'#ff3e9a'} },
  { id:'ember',     name:'Ember Heat',         mood:'dark',  font:'grotesk',   layout:'poster',    kw:['energy','hot','loud','rock','punk','bold','fire','aggressive','hard','rap','hype'],    palette:{bg:'#0c0805',surface:'#1a120b',line:'#2e2114',ink:'#fdf3ea',ink2:'#d6a98a',accent:'#ff5029',accent2:'#ffb84a'} },
  { id:'paper',     name:'Sun-Faded Paper',    mood:'light', font:'serif',     layout:'zine',      kw:['americana','folk','warm','acoustic','vintage','indie','soft','country','intimate'],   palette:{bg:'#f4ece0',surface:'#fbf6ee',line:'#e0d3c0',ink:'#211a12',ink2:'#6f5f4a',accent:'#c2451f',accent2:'#3b6b4a'} },
  { id:'neon',      name:'Neon Hyperpop',      mood:'dark',  font:'mono',      layout:'gallery',   kw:['neon','hyperpop','electronic','pop','club','glitch','future','rave','synth','dance'],  palette:{bg:'#07060f',surface:'#120f24',line:'#241f3e',ink:'#f0fbff',ink2:'#8fd0e6',accent:'#22e5d4',accent2:'#ff3e9a'} },
  { id:'mint',      name:'Cool Mint',          mood:'light', font:'grotesk',   layout:'gallery',   kw:['fresh','clean','minimal','airy','calm','ambient','chill','lo-fi','modern','bright'],   palette:{bg:'#eef4f0',surface:'#ffffff',line:'#d6e2da',ink:'#0e1a14',ink2:'#5a7065',accent:'#1f8a5b',accent2:'#2a6fdb'} },
  { id:'cobalt',    name:'Cobalt Midnight',    mood:'dark',  font:'editorial', layout:'spotlight', kw:['blue','cool','dreamy','shoegaze','synth','melancholy','wave','deep','ocean','night'],  palette:{bg:'#070a14',surface:'#0f1626',line:'#1d2940',ink:'#eef3fb',ink2:'#9db4d6',accent:'#5b8dff',accent2:'#22e5d4'} },
  { id:'bubblegum', name:'Bubblegum',          mood:'light', font:'grotesk',   layout:'poster',    kw:['fun','playful','pop','cute','bubbly','bright','happy','colorful','teen','sweet'],      palette:{bg:'#fff0f6',surface:'#ffffff',line:'#ffd0e4',ink:'#2a0a1c',ink2:'#a04f72',accent:'#ff3e9a',accent2:'#b983ff'} },
  { id:'noir',      name:'Concrete Noir',      mood:'dark',  font:'mono',      layout:'zine',      kw:['industrial','techno','minimal','brutal','grey','underground','warehouse','noir'],      palette:{bg:'#0a0a0b',surface:'#141416',line:'#262629',ink:'#f2f2f3',ink2:'#9a9a9e',accent:'#e8e8ea',accent2:'#ff5029'} },
  { id:'jazz',      name:'Blue Note',          mood:'dark',  font:'serif',     layout:'spotlight', kw:['jazz','soul','blues','smooth','bebop','classic','vinyl'],                              palette:{bg:'#08080f',surface:'#12121e',line:'#20203a',ink:'#f0ece4',ink2:'#9090a8',accent:'#4060ff',accent2:'#d4b060'} },
  { id:'lofi',      name:'Lo-Fi Bedroom',      mood:'dark',  font:'mono',      layout:'zine',      kw:['lofi','bedroom','cassette','tape','chill','hazy','vintage'],                           palette:{bg:'#1a1610',surface:'#231e18',line:'#352e24',ink:'#f0e8d0',ink2:'#a89070',accent:'#d4a060',accent2:'#8090a0'} },
];

const ROLES: Record<Role, RoleDef> = {
  artist: {
    label:'Artist', defaultName:'Jordan Nore', defaultVibe:'moody late-night alt-R&B, smooth and a little mysterious',
    hero:{ kicker:'ARTIST · CHICAGO', stat:'2,140', statLabel:'HYPE this month', cta:'▶ Listen' },
    tagline:'Slow songs for late trains home.',
    bio:"Alt-R&B out of Logan Square. I write at night and record into whatever's closest. Three EPs, one band, zero rush.",
    sections:[
      { kind:'tracks', title:'Top tracks', items:[{t:'Velvet Hours',m:'2:58 · 540 HYPE'},{t:'Carmine',m:'3:24 · 412 HYPE'},{t:'Northbound',m:'4:01 · 388 HYPE'},{t:'Slow Combust',m:'3:12 · 301 HYPE'}] },
      { kind:'shows',  title:'Next shows', items:[{t:'Empty Bottle',m:'Fri Jun 6 · Ukrainian Village'},{t:'Sleeping Village',m:'Sat Jun 21 · Avondale'}] },
    ],
  },
  venue: {
    label:'Venue', defaultName:'Empty Bottle', defaultVibe:'gritty, beloved 400-cap room — indie, punk, electronic',
    hero:{ kicker:'VENUE · UKRAINIAN VILLAGE', stat:'400', statLabel:'capacity', cta:'Book this room' },
    tagline:"Chicago's living room for loud music.",
    bio:"400 capacity, open since '92. Indie, punk, and electronic seven nights a week. If it's about to break, it played here first.",
    sections:[
      { kind:'shows', title:'This month', items:[{t:'Mau Lwin',m:'Thu Jun 5 · bedroom pop'},{t:'The Veldt Kids',m:'Sat Jun 14 · post-punk'},{t:'Dossier',m:'Fri Jun 27 · house / electronic'}] },
      { kind:'about', title:'The room',   items:[{t:'Capacity 400',m:'Standing · two bars · green room'},{t:'Load-in',m:'Alley access · house backline available'}] },
    ],
  },
  promoter: {
    label:'Promoter', defaultName:'Late Hour Collective', defaultVibe:'tastemaker club nights — house, techno, after-dark energy',
    hero:{ kicker:'PROMOTER · CHICAGO', stat:'128', statLabel:'shows presented', cta:'Pitch me a date' },
    tagline:'We throw the nights you hear about Monday.',
    bio:'Independent promoters since 2019. House, techno, and the occasional left turn. 81% average sell-through across 128 shows.',
    sections:[
      { kind:'shows', title:'Recent nights', items:[{t:'Basement Heat · Vol 9',m:'Sold out · 480 cap'},{t:'After Dark w/ Dossier',m:'92% paid · Pilsen'},{t:'Warehouse Series 04',m:'Sold out · secret location'}] },
      { kind:'about', title:'What we book', items:[{t:'House · techno · club',m:'300–800 cap rooms'},{t:'Late slots',m:'10pm–4am · weekends'}] },
    ],
  },
  fan: {
    label:'Fan', defaultName:'Riley', defaultVibe:'a music-obsessed regular who lives for live shows',
    hero:{ kicker:'FAN · CHICAGO', stat:'1,204', statLabel:'HYPE given', cta:'+ Follow' },
    tagline:'I was into them before, obviously.',
    bio:"Show-goer, seed-swiper, certified early adopter. I've HYPEd 1,204 times and been to 38 shows this year. Ask me who's next.",
    sections:[
      { kind:'tracks', title:'My top 5 this week', items:[{t:'Jordan Nore',m:'Alt-R&B · 12 HYPE'},{t:'Mau Lwin',m:'Bedroom pop · 9 HYPE'},{t:'The Veldt Kids',m:'Post-punk · 7 HYPE'},{t:'Sasha Quill',m:'Hyperpop · 6 HYPE'}] },
      { kind:'shows',  title:"Shows I've been to", items:[{t:'38 shows',m:'this year · 6 cities'},{t:'Front row certified',m:'Empty Bottle regular'}] },
    ],
  },
};

const VIBE_CHIPS: Record<Role, string[]> = {
  artist:   ['moody late-night R&B','sun-faded indie folk','neon hyperpop','DIY punk zine','dreamy shoegaze','bold rap energy'],
  venue:    ['gritty beloved dive','sleek modern club','warm listening room','industrial warehouse'],
  promoter: ['after-dark techno','tastemaker indie nights','big festival energy','underground warehouse'],
  fan:      ['certified early adopter','vinyl-obsessed purist','front-row regular','hyperpop stan'],
};

const IMAGE_RE = /\b(background|image|photo|picture|graphic|cartoon|illustrat|artwork|texture|scene|wallpaper|mural|monster|anime|manga|drawing|painting|landscape|skyline|city|forest|concert|stage|crowd|godzilla|dinosaur|fire|neon sign|graffiti|abstract)\b/i;

// ── HELPERS ────────────────────────────────────────────────────────────────
function clone<T>(o: T): T { return JSON.parse(JSON.stringify(o)); }
function makeContent(r: Role): Content {
  const d = ROLES[r];
  return { name: d.defaultName, tagline: d.tagline, bio: d.bio, hero: clone(d.hero), sections: clone(d.sections), defaultVibe: d.defaultVibe };
}
function esc(s: string): string {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function hx(n: number): string { return Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0'); }
function parseHex(h: string): [number,number,number] { return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
function darken(h: string, f: number): string { const [r,g,b]=parseHex(h); return '#'+hx(r*(1-f))+hx(g*(1-f))+hx(b*(1-f)); }
function saturate(h: string): string { const [r,g,b]=parseHex(h); const mx=Math.max(r,g,b); return '#'+[r,g,b].map(v=>hx(v+(v===mx?40:-15))).join(''); }
function makeId(): string { return Math.random().toString(36).slice(2); }
function toSlug(s: string): string { return s.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'') || 'you'; }

// ── FALLBACK DIRECTIONS ────────────────────────────────────────────────────
function fallbackDirections(vibe: string, role: Role): Theme[] {
  const v = vibe.toLowerCase();
  const scored = LOOKS.map(l => ({ l, s: l.kw.reduce((a,k) => a+(v.includes(k)?1:0), 0) + Math.random()*0.4 }));
  scored.sort((a,b) => b.s - a.s);
  const picks: Look[] = [];
  for (const {l} of scored) {
    if (picks.length >= 3) break;
    if (picks.some(p => p.mood===l.mood && p.layout===l.layout)) continue;
    picks.push(l);
  }
  while (picks.length < 3) { const l = scored[picks.length].l; if (!picks.includes(l)) picks.push(l); }
  return picks.slice(0,3).map(l => ({ name:l.name, mood:l.mood, font:l.font, layout:l.layout, palette:{...l.palette}, tagline:ROLES[role].tagline, bio:ROLES[role].bio, radius:14 }));
}

// ── HEURISTIC REFINE ──────────────────────────────────────────────────────
function heuristicRefine(ins: string, theme: Theme, content: Content): Theme {
  const t = clone(theme); const s = ins.toLowerCase(); const P = t.palette;
  if (/dark|moody|night|black/.test(s)) { t.mood='dark'; P.bg=darken(P.bg,.5); P.surface=darken(P.surface,.4); P.ink='#f3eefb'; P.ink2='#b9a9d6'; }
  if (/light|bright|white|clean/.test(s)) { t.mood='light'; P.bg='#f4ece0'; P.surface='#fff'; P.line='#e0d3c0'; P.ink='#1c160f'; P.ink2='#6f5f4a'; }
  if (/bold|loud|pop|vivid/.test(s)) { P.accent=saturate(P.accent); P.accent2=saturate(P.accent2); }
  if (/minimal|quiet|calm/.test(s)) t.layout='zine';
  if (/serif|elegant/.test(s)) t.font='serif';
  if (/mono|tech|digital/.test(s)) t.font='mono';
  if (/poster|big/.test(s)) t.layout='poster';
  if (/gallery|grid/.test(s)) t.layout='gallery';
  if (/spotlight|center/.test(s)) t.layout='spotlight';
  const cm: Record<string,string> = { red:'#ff5029', orange:'#ff7a29', pink:'#ff3e9a', purple:'#b983ff', blue:'#5b8dff', teal:'#22e5d4', green:'#1f8a5b', amber:'#ffb84a' };
  for (const k in cm) if (s.includes(k)) { P.accent=cm[k]; break; }
  t.bio = content.bio;
  return t;
}

// ── PREVIEW HTML ───────────────────────────────────────────────────────────
function sectionHTML(s: Section): string {
  if (s.kind === 'tracks') {
    return `<section class="pg-sec"><h2 class="pg-sec-t">${esc(s.title)}</h2><div class="pg-rows">${s.items.map((it,i)=>`<div class="pg-row"><span class="pg-rn">${String(i+1).padStart(2,'0')}</span><span class="pg-pl">▶</span><span class="pg-rm"><b>${esc(it.t)}</b><small>${esc(it.m)}</small></span><button class="pg-hype">♥ HYPE</button></div>`).join('')}</div></section>`;
  }
  if (s.kind === 'shows') {
    return `<section class="pg-sec"><h2 class="pg-sec-t">${esc(s.title)}</h2><div class="pg-cards">${s.items.map(it=>`<div class="pg-card"><div class="pg-card-b"><b>${esc(it.t)}</b><small>${esc(it.m)}</small></div><span class="pg-chip">tickets</span></div>`).join('')}</div></section>`;
  }
  return `<section class="pg-sec"><h2 class="pg-sec-t">${esc(s.title)}</h2><div class="pg-cards">${s.items.map(it=>`<div class="pg-card plain"><div class="pg-card-b"><b>${esc(it.t)}</b><small>${esc(it.m)}</small></div></div>`).join('')}</div></section>`;
}

function renderPreviewHTML(content: Content, theme: Theme): string {
  const c = content; const h = c.hero;
  const ini = c.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const safeHero = theme.heroUrl?.startsWith('blob:') ? theme.heroUrl : '';
  const heroPart = safeHero
    ? `<img src="${safeHero}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">`
    : `<div style="width:100%;height:100%;background:${theme.palette.surface}"></div>`;
  return `
    <div class="pg-hero" style="min-height:${theme.layout==='poster'?'360px':'270px'}">
      <div class="pg-hbg">${heroPart}</div>
      <div class="pg-scrim"></div>
      <div class="pg-in">
        <div class="pg-av-wrap"><div class="pg-av-fb">${esc(ini)}</div></div>
        <div class="pg-kicker">${esc(h.kicker)}</div>
        <h1 class="pg-name" contenteditable="true" spellcheck="false" data-edit="name">${esc(c.name)}</h1>
        <p class="pg-tag" contenteditable="true" spellcheck="false" data-edit="tagline">${esc(c.tagline)}</p>
        <div class="pg-hero-row">
          <button class="pg-cta">${esc(h.cta)}</button>
          <div class="pg-stat"><b>${esc(h.stat)}</b><span>${esc(h.statLabel)}</span></div>
        </div>
      </div>
    </div>
    <div class="pg-body">
      <section class="pg-sec"><h2 class="pg-sec-t">About</h2><p class="pg-bio" contenteditable="true" spellcheck="false" data-edit="bio">${esc(c.bio)}</p></section>
      ${c.sections.map(sectionHTML).join('')}
      <div class="pg-foot">Made with <b>iHYPE</b> · ihype.fm/${toSlug(c.name)}</div>
    </div>`;
}

// ── STYLES ─────────────────────────────────────────────────────────────────
const STYLES = `
/* ── APP GRID ── */
.ps2-app { display:grid; grid-template-columns:370px 1fr; height:100%; overflow:hidden; background:#0a0805; color:#f0ebe5; font-family:'DM Sans',sans-serif; -webkit-font-smoothing:antialiased; }
.ps2-app *,.ps2-app *::before,.ps2-app *::after { box-sizing:border-box; margin:0; padding:0; }
.ps2-app button { font:inherit; color:inherit; background:none; border:none; cursor:pointer; }
.ps2-app input,.ps2-app textarea { font:inherit; color:inherit; }
.ps2-app ::-webkit-scrollbar { width:5px; }
.ps2-app ::-webkit-scrollbar-thumb { background:#3a342e; border-radius:5px; }

/* ── CHAT PANEL ── */
.ps2-chat { background:#100d09; border-right:1px solid rgba(255,255,255,.07); display:flex; flex-direction:column; overflow:hidden; }

.ps2-chat-hd { display:flex; align-items:center; gap:11px; padding:13px 16px 12px; border-bottom:1px solid rgba(255,255,255,.07); flex-shrink:0; }
.ps2-chat-icon { width:30px; height:30px; border-radius:10px; background:linear-gradient(135deg,#ff5029,#ff3e9a); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; box-shadow:0 4px 16px -4px rgba(255,80,41,.5); }
.ps2-chat-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; letter-spacing:-.01em; }
.ps2-chat-sub { margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:9px; color:#5a5048; letter-spacing:.12em; }
.ps2-new-btn { padding:5px 10px; border-radius:7px; border:1px solid rgba(255,255,255,.07); background:#1a1612; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:600; letter-spacing:.06em; color:#5a5048; }
.ps2-new-btn:hover { color:#f0ebe5; border-color:rgba(255,255,255,.15); }

/* ── MESSAGES ── */
.ps2-msgs { flex:1; overflow-y:auto; padding:14px 14px 8px; display:flex; flex-direction:column; gap:12px; scroll-behavior:smooth; }
.ps2-msg { display:flex; gap:8px; }
.ps2-msg.ai { align-items:flex-start; }
.ps2-msg.user { flex-direction:row-reverse; }
.ps2-av { width:24px; height:24px; border-radius:8px; background:linear-gradient(135deg,#ff5029,#ff3e9a); display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; margin-top:2px; }
.ps2-bub { padding:10px 13px; border-radius:14px; font-size:13px; line-height:1.55; word-break:break-word; }
.ps2-msg.ai .ps2-bub { background:#3a342e; border:1px solid rgba(255,255,255,.15); border-left:2px solid #ff5029; color:#f0ebe5; border-top-left-radius:4px; max-width:300px; }
.ps2-msg.user .ps2-bub { background:#ff5029; color:#0a0805; font-weight:500; border-top-right-radius:4px; max-width:260px; }

/* ── CHIPS ── */
.ps2-chips-wrap { display:flex; gap:8px; align-items:flex-start; }
.ps2-chips-wrap .ps2-av { opacity:0; pointer-events:none; }
.ps2-chips-row { display:flex; flex-wrap:wrap; gap:6px; max-width:310px; }
.ps2-chip { padding:7px 13px; border-radius:99px; border:1px solid rgba(255,255,255,.15); background:#1a1612; font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:600; letter-spacing:.03em; color:#9e9080; transition:all .13s; }
.ps2-chip:hover:not(:disabled) { color:#f0ebe5; border-color:#ff5029; }
.ps2-chip.picked { background:#ff5029; color:#0a0805; border-color:#ff5029; pointer-events:none; }
.ps2-chip:disabled:not(.picked) { opacity:.35; cursor:default; }

/* ── DIRECTION CARDS ── */
.ps2-dirs-wrap { display:flex; gap:8px; align-items:flex-start; }
.ps2-dirs-wrap .ps2-av { opacity:0; pointer-events:none; }
.ps2-dirs-row { display:flex; gap:7px; max-width:316px; }
.ps2-dcard { flex:1; border-radius:11px; border:1px solid rgba(255,255,255,.07); background:#1a1612; overflow:hidden; cursor:pointer; transition:border-color .14s,transform .14s; }
.ps2-dcard:hover { border-color:rgba(255,255,255,.15); transform:translateY(-2px); }
.ps2-dcard.on { border-color:#ff5029; box-shadow:0 0 0 1px #ff5029; }
.ps2-dp { height:42px; position:relative; overflow:hidden; }
.ps2-dp-bar { position:absolute; left:7px; top:7px; width:22px; height:5px; border-radius:99px; }
.ps2-dp-dot { position:absolute; right:6px; top:6px; width:7px; height:7px; border-radius:99px; }
.ps2-dp-lines { position:absolute; bottom:7px; left:7px; right:7px; display:flex; flex-direction:column; gap:3px; }
.ps2-dp-lines i { height:2px; border-radius:99px; display:block; }
.ps2-dp-lines i:last-child { width:60%; opacity:.5; }
.ps2-dm { padding:6px 8px 8px; }
.ps2-dm b { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; color:#f0ebe5; display:block; }
.ps2-dm span { font-family:'JetBrains Mono',monospace; font-size:9px; color:#5a5048; letter-spacing:.04em; }

/* ── TYPING ── */
.ps2-typing-wrap { display:flex; gap:8px; align-items:flex-start; }
.ps2-dots { display:flex; gap:4px; align-items:center; padding:11px 14px; background:#1a1612; border:1px solid rgba(255,255,255,.07); border-radius:14px; border-top-left-radius:4px; }
.ps2-dots span { width:6px; height:6px; border-radius:99px; background:#5a5048; animation:ps2-db .9s infinite; }
.ps2-dots span:nth-child(2) { animation-delay:.15s; }
.ps2-dots span:nth-child(3) { animation-delay:.3s; }
@keyframes ps2-db { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }

/* ── CHAT FOOTER ── */
.ps2-chat-ft { border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }
.ps2-in-row { display:flex; gap:7px; align-items:center; padding:11px 12px 8px; }
.ps2-in { flex:1; background:#1a1612; border:1px solid rgba(255,255,255,.15); border-radius:10px; padding:10px 12px; font-size:13px; resize:none; outline:none; }
.ps2-in::placeholder { color:#5a5048; }
.ps2-in:focus { border-color:#ff5029; }
.ps2-in:disabled { opacity:.38; }
.ps2-send-btn { width:36px; height:36px; border-radius:9px; background:#ff5029; color:#0a0805; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:filter .12s; }
.ps2-send-btn:hover:not(:disabled) { filter:brightness(1.1); }
.ps2-send-btn:disabled { opacity:.35; }

/* ── ASSET STRIP ── */
.ps2-ast-strip { display:flex; gap:5px; padding:0 12px 11px; flex-wrap:wrap; }
.ps2-ab { display:flex; align-items:center; gap:5px; padding:5px 9px; border-radius:7px; border:1px solid rgba(255,255,255,.07); background:#1a1612; font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:600; letter-spacing:.04em; color:#5a5048; transition:all .13s; }
.ps2-ab:hover { color:#f0ebe5; border-color:rgba(255,255,255,.15); }
.ps2-ab.on { color:#ff5029; border-color:rgba(255,80,41,.4); background:rgba(255,80,41,.07); }
.ps2-ab-prime { color:#f0ebe5; border-color:rgba(255,255,255,.15); }

/* ── STAGE ── */
.ps2-stage { position:relative; overflow:hidden; background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(255,80,41,.06),transparent 60%),repeating-linear-gradient(45deg,transparent 0 11px,rgba(255,255,255,.012) 11px 12px),#0c0a08; display:flex; align-items:center; justify-content:center; padding:38px 34px 34px; }
.ps2-stbar { position:absolute; top:0; left:0; right:0; height:42px; display:flex; align-items:center; gap:10px; padding:0 18px; z-index:6; }
.ps2-url-pill { display:flex; align-items:center; gap:7px; background:rgba(16,13,9,.75); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.07); border-radius:99px; padding:6px 13px; font-family:'JetBrains Mono',monospace; font-size:11px; color:#9e9080; }
.ps2-url-pill b { color:#f0ebe5; font-weight:600; }
.ps2-stage-r { margin-left:auto; display:flex; align-items:center; gap:8px; }
.ps2-dev-seg { display:flex; background:#1a1612; border:1px solid rgba(255,255,255,.07); border-radius:8px; padding:3px; gap:2px; }
.ps2-dev-seg button { padding:5px 10px; border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:600; letter-spacing:.06em; color:#5a5048; display:flex; align-items:center; gap:5px; transition:all .12s; }
.ps2-dev-seg button.on { background:#0a0805; color:#f0ebe5; }
.ps2-theme-tag { font-family:'JetBrains Mono',monospace; font-size:10px; color:#5a5048; letter-spacing:.08em; }
.ps2-theme-tag b { color:#f0ebe5; }
.ps2-epk-btn { padding:7px 13px; border-radius:7px; background:#1a1612; border:1px solid rgba(255,255,255,.15); font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; letter-spacing:.04em; display:inline-flex; align-items:center; gap:6px; color:#f0ebe5; }
.ps2-epk-btn:hover { border-color:#ff5029; color:#ff5029; }
.ps2-pub-btn { padding:7px 15px; border-radius:7px; background:#ff5029; color:#0a0805; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; letter-spacing:.05em; display:inline-flex; align-items:center; gap:6px; }
.ps2-pub-btn:hover { filter:brightness(1.08); }

/* ── VIEWPORT ── */
.ps2-vp { position:relative; border-radius:16px; overflow:hidden; background:#111; box-shadow:0 40px 90px -30px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.05); transition:box-shadow .3s; }
.ps2-stage[data-d="desktop"] .ps2-vp { width:min(870px,100%); height:min(78vh,740px); }
.ps2-stage[data-d="mobile"]  .ps2-vp { width:375px; height:min(78vh,760px); border-radius:34px; border:9px solid #1a1612; }
.ps2-stage.gen .ps2-vp { animation:ps2-pg 1.1s ease-in-out infinite; }
@keyframes ps2-pg { 0%,100%{box-shadow:0 40px 90px -30px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.05)} 50%{box-shadow:0 40px 90px -30px rgba(0,0,0,.7),0 0 0 2px #b983ff} }

#ps2-pr { position:absolute; inset:0; overflow:hidden; }
#ps2-ps { height:100%; overflow-y:auto; }

/* ── EMPTY STATE ── */
.ps2-empty { position:absolute; inset:0; background:#100d09; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px; }
.ps2-spark { width:58px; height:58px; border-radius:18px; background:linear-gradient(135deg,#ff5029,#ff3e9a); display:flex; align-items:center; justify-content:center; font-size:26px; margin-bottom:18px; box-shadow:0 12px 40px -8px rgba(255,80,41,.45); }
.ps2-empty h3 { font-family:'Syne',sans-serif; font-weight:800; font-size:22px; letter-spacing:-.02em; margin-bottom:8px; }
.ps2-empty p { font-size:13px; color:#9e9080; line-height:1.6; max-width:320px; }
.ps2-hint { margin-top:18px; font-family:'JetBrains Mono',monospace; font-size:9.5px; color:#5a5048; letter-spacing:.1em; display:flex; align-items:center; gap:8px; }
.ps2-hint::before,.ps2-hint::after { content:''; height:1px; width:24px; background:rgba(255,255,255,.15); }

/* ── TOAST ── */
.ps2-toast { position:absolute; bottom:22px; left:50%; transform:translateX(-50%) translateY(10px); z-index:8; background:#1a1612; border:1px solid #b983ff; color:#f0ebe5; padding:9px 18px; border-radius:99px; font-family:'JetBrains Mono',monospace; font-size:11px; opacity:0; transition:opacity .22s,transform .22s; pointer-events:none; white-space:nowrap; max-width:90%; }
.ps2-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

/* ── PAGE PREVIEW ── */
#ps2-pr .pg-hero { position:relative; }
#ps2-pr .pg-hbg { position:absolute; inset:0; background-size:cover; background-position:center; }
#ps2-pr .pg-scrim { position:absolute; inset:0; background:linear-gradient(180deg,color-mix(in srgb,var(--p-bg) 18%,transparent),var(--p-bg) 90%); }
#ps2-pr .pg-in { position:relative; padding:54px 42px 40px; display:flex; flex-direction:column; align-items:flex-start; gap:14px; }
#ps2-pr[data-layout="spotlight"] .pg-in { align-items:center; text-align:center; padding-top:66px; }
#ps2-pr[data-layout="poster"] .pg-in { padding-top:82px; padding-bottom:52px; }
#ps2-pr .pg-av-wrap { position:relative; width:88px; height:88px; }
#ps2-pr .pg-av-fb { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--p-display,'Syne'),sans-serif; font-weight:800; font-size:28px; color:var(--p-bg); background:linear-gradient(135deg,var(--p-accent),var(--p-accent2)); border-radius:50%; }
#ps2-pr .pg-kicker { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:11px; font-weight:600; letter-spacing:.2em; color:var(--p-accent); text-transform:uppercase; }
#ps2-pr .pg-name { font-family:var(--p-display,'Syne'),sans-serif; font-weight:var(--p-dweight,800); font-size:58px; line-height:1.02; letter-spacing:var(--p-tight,-.03em); color:var(--p-ink); outline:none; width:100%; }
#ps2-pr[data-layout="poster"] .pg-name { font-size:80px; }
#ps2-pr[data-layout="zine"] .pg-name { font-size:50px; }
#ps2-pr .pg-tag { font-family:var(--p-serif,'Instrument Serif'),serif; font-size:20px; line-height:1.35; color:var(--p-ink2); font-style:italic; max-width:520px; outline:none; }
#ps2-pr .pg-hero-row { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
#ps2-pr[data-layout="spotlight"] .pg-hero-row { justify-content:center; }
#ps2-pr .pg-cta { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:12px; font-weight:700; letter-spacing:.04em; color:var(--p-bg); background:var(--p-accent); padding:12px 22px; border-radius:14px; border:none; cursor:pointer; }
#ps2-pr .pg-stat { display:flex; flex-direction:column; }
#ps2-pr .pg-stat b { font-family:var(--p-display,'Syne'),sans-serif; font-weight:800; font-size:24px; letter-spacing:-.02em; color:var(--p-ink); line-height:1; }
#ps2-pr .pg-stat span { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:9px; letter-spacing:.14em; color:var(--p-ink2); text-transform:uppercase; margin-top:4px; }
#ps2-pr .pg-body { padding:8px 42px 44px; display:flex; flex-direction:column; gap:28px; }
#ps2-pr .pg-sec-t { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:10px; font-weight:700; letter-spacing:.18em; color:var(--p-ink2); text-transform:uppercase; margin-bottom:14px; padding-bottom:9px; border-bottom:1px solid var(--p-line); }
#ps2-pr .pg-bio { font-family:var(--p-body,'DM Sans'),sans-serif; font-size:15px; line-height:1.65; color:var(--p-ink); max-width:580px; outline:none; }
#ps2-pr .pg-rows { display:flex; flex-direction:column; gap:2px; }
#ps2-pr .pg-row { display:flex; align-items:center; gap:13px; padding:11px 12px; border-radius:14px; transition:background .14s; }
#ps2-pr .pg-row:hover { background:var(--p-surface); }
#ps2-pr .pg-rn { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:11px; color:var(--p-ink2); width:18px; }
#ps2-pr .pg-pl { color:var(--p-accent); font-size:10px; }
#ps2-pr .pg-rm { flex:1; display:flex; flex-direction:column; gap:3px; }
#ps2-pr .pg-rm b { font-family:var(--p-display,'Syne'),sans-serif; font-weight:600; font-size:15px; color:var(--p-ink); letter-spacing:-.01em; }
#ps2-pr .pg-rm small { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:9.5px; color:var(--p-ink2); letter-spacing:.04em; }
#ps2-pr .pg-hype { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:9px; font-weight:700; letter-spacing:.06em; color:var(--p-accent2); border:1px solid color-mix(in srgb,var(--p-accent2) 40%,transparent); padding:5px 10px; border-radius:99px; background:none; cursor:pointer; }
#ps2-pr .pg-cards { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
#ps2-pr[data-layout="gallery"] .pg-cards { grid-template-columns:repeat(3,1fr); }
#ps2-pr .pg-card { background:var(--p-surface); border:1px solid var(--p-line); border-radius:14px; padding:14px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
#ps2-pr .pg-card.plain { background:transparent; }
#ps2-pr .pg-card-b b { font-family:var(--p-display,'Syne'),sans-serif; font-weight:700; font-size:14px; color:var(--p-ink); letter-spacing:-.01em; display:block; }
#ps2-pr .pg-card-b small { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:9px; color:var(--p-ink2); letter-spacing:.03em; margin-top:4px; display:block; }
#ps2-pr .pg-chip { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:8px; font-weight:700; letter-spacing:.1em; color:var(--p-bg); background:var(--p-accent); padding:5px 9px; border-radius:99px; text-transform:uppercase; flex-shrink:0; }
#ps2-pr .pg-foot { font-family:var(--p-label,'JetBrains Mono'),monospace; font-size:9px; color:var(--p-ink2); letter-spacing:.08em; padding-top:16px; border-top:1px solid var(--p-line); text-align:center; }
#ps2-pr .pg-foot b { color:var(--p-accent); }
.ps2-stage[data-d="mobile"] #ps2-pr .pg-in { padding:46px 20px 28px; }
.ps2-stage[data-d="mobile"] #ps2-pr .pg-name { font-size:38px !important; }
.ps2-stage[data-d="mobile"] #ps2-pr .pg-tag { font-size:16px; }
.ps2-stage[data-d="mobile"] #ps2-pr .pg-body { padding:8px 20px 32px; }
.ps2-stage[data-d="mobile"] #ps2-pr .pg-cards { grid-template-columns:1fr !important; }
`;

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Bricolage+Grotesque:wght@400;600;700;800&display=swap';

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function ViewPageStudio({ data }: { data?: WorkbenchData } = {}) {
  const initRole: Role = data?.activeProfileTypes?.includes('ARTIST') ? 'artist'
    : data?.activeProfileTypes?.includes('VENUE') ? 'venue' : 'fan';

  const [role, setRole] = useState<Role>(initRole);
  const [device, setDevice] = useState<Device>('desktop');
  const [theme, setTheme] = useState<Theme | null>(null);
  const [directions, setDirections] = useState<Theme[]>([]);
  const [generating, setGenerating] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [inputEnabled, setInputEnabled] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState('Choose a role above…');
  const [flowStep, setFlowStep] = useState(0);
  const [urlName, setUrlName] = useState('you');
  const [toastMsg, setToastMsg] = useState('');
  const [toastOn, setToastOn] = useState(false);
  const [pubLabel, setPubLabel] = useState('↗ Publish page');
  const [showTyping, setShowTyping] = useState(false);

  // artist-specific
  const [artistGenre, setArtistGenre] = useState('');
  const [artistStage, setArtistStage] = useState('');

  const contentRef = useRef<Content>(makeContent(initRole));
  const roleRef = useRef<Role>(initRole);
  const pageRootRef = useRef<HTMLDivElement>(null);
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pubTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);
  const themeRef = useRef<Theme | null>(null);
  const directionsRef = useRef<Theme[]>([]);
  const artistGenreRef = useRef('');
  const artistStageRef = useRef('');

  /* inject styles + fonts once */
  useEffect(() => {
    if (!document.getElementById('ps2-styles')) {
      const s = document.createElement('style'); s.id = 'ps2-styles'; s.textContent = STYLES; document.head.appendChild(s);
    }
    if (!document.getElementById('ps2-fonts')) {
      const l = document.createElement('link'); l.id = 'ps2-fonts'; l.rel = 'stylesheet'; l.href = FONT_HREF; document.head.appendChild(l);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (pubTimer.current) clearTimeout(pubTimer.current);
    };
  }, []);

  /* start flow on mount */
  useEffect(() => { startFlow(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* scroll chat to bottom */
  const scrollChat = useCallback(() => {
    setTimeout(() => { if (msgsRef.current) msgsRef.current.scrollTop = 9999; }, 40);
  }, []);

  function addMsg(msg: ChatMsg) {
    setChatMsgs((prev: ChatMsg[]) => [...prev, msg]);
  }

  function toast(msg: string) {
    setToastMsg(msg); setToastOn(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 3000);
  }

  /* answer a chips message — mark which chip was picked */
  function answerChips(msgId: string, value: string) {
    setChatMsgs((prev: ChatMsg[]) => prev.map((m: ChatMsg) =>
      m.id === msgId && m.type === 'chips' ? { ...m, answered: value } : m
    ));
  }

  /* ── FLOW ── */
  function startFlow() {
    stepRef.current = 0;
    setChatMsgs([]);
    setFlowStep(0);
    setInputEnabled(false);
    setInputPlaceholder('Choose a role above…');
    setTheme(null); themeRef.current = null;
    setDirections([]); directionsRef.current = [];
    setArtistGenre(''); artistGenreRef.current = '';
    setArtistStage(''); artistStageRef.current = '';
    contentRef.current = makeContent(roleRef.current);
    if (pageScrollRef.current) pageScrollRef.current.innerHTML = '';

    setTimeout(() => {
      addMsg({ id: makeId(), type: 'ai', html: "Hey! I'm your <b>AI page builder</b>. Let's create a page that truly represents your brand. <b>What kind of page are you making?</b>" });
      setTimeout(() => {
        const chipsMsgId = makeId();
        addMsg({
          id: chipsMsgId, type: 'chips', kind: 'role',
          chips: [{ value: 'artist', label: '🎵 Artist' }, { value: 'venue', label: '🏟 Venue' }, { value: 'promoter', label: '📣 Promoter' }, { value: 'fan', label: '🎧 Fan' }],
        });
        scrollChat();
      }, 350);
    }, 280);
  }

  function handleRoleChip(msgId: string, val: Role) {
    answerChips(msgId, val);
    roleRef.current = val;
    setRole(val);
    contentRef.current = makeContent(val);
    addMsg({ id: makeId(), type: 'user', text: { artist: 'Artist 🎵', venue: 'Venue 🏟', promoter: 'Promoter 📣', fan: 'Fan 🎧' }[val] });
    stepRef.current = 1;
    setFlowStep(1);
    setTimeout(() => {
      addMsg({ id: makeId(), type: 'ai', html: `What's your name — or your act's name?` });
      setInputPlaceholder(`e.g. "${ROLES[val].defaultName}"`);
      setInputEnabled(true);
      scrollChat();
    }, 380);
  }

  function handleGenreChip(msgId: string, genre: string) {
    answerChips(msgId, genre);
    artistGenreRef.current = genre;
    setArtistGenre(genre);
    addMsg({ id: makeId(), type: 'user', text: genre });
    stepRef.current = 3;
    setFlowStep(3);
    setTimeout(() => {
      addMsg({ id: makeId(), type: 'ai', html: 'Where are you at right now as an artist?' });
      const stageMsgId = makeId();
      addMsg({
        id: stageMsgId, type: 'chips', kind: 'stage',
        chips: [
          { value: 'starting',  label: 'Just starting out' },
          { value: 'releasing', label: 'Releasing music' },
          { value: 'touring',   label: 'Actively touring' },
          { value: 'booking',   label: 'Looking for gigs' },
        ],
      });
      setInputPlaceholder('Select above…');
      setInputEnabled(false);
      scrollChat();
    }, 380);
  }

  function handleStageChip(msgId: string, stage: string) {
    answerChips(msgId, stage);
    artistStageRef.current = stage;
    setArtistStage(stage);
    addMsg({ id: makeId(), type: 'user', text: { starting: 'Just starting out', releasing: 'Releasing music', touring: 'Actively touring', booking: 'Looking for gigs' }[stage] || stage });
    stepRef.current = 4;
    setFlowStep(4);
    setTimeout(() => {
      addMsg({ id: makeId(), type: 'ai', html: 'Last one — <b>describe your sound or aesthetic</b> in a few words:' });
      const chipsMsgId = makeId();
      addMsg({
        id: chipsMsgId, type: 'chips', kind: 'vibe',
        chips: (VIBE_CHIPS[roleRef.current as Role] as string[]).map((v: string) => ({ value: v, label: v })),
      });
      setInputPlaceholder(`e.g. "${(ROLES[roleRef.current as Role] as RoleDef).defaultVibe}"`);
      setInputEnabled(true);
      scrollChat();
    }, 380);
  }

  function handleVibeChip(msgId: string, vibe: string) {
    answerChips(msgId, vibe);
    addMsg({ id: makeId(), type: 'user', text: vibe });
    doGenerate(vibe);
  }

  async function doGenerate(vibeText: string) {
    setInputEnabled(false);
    setInputPlaceholder('Building your page…');
    setGenerating(true);
    setShowTyping(true);
    scrollChat();

    await new Promise(r => setTimeout(r, 1300));
    setShowTyping(false);
    setGenerating(false);

    const dirs = fallbackDirections(vibeText, roleRef.current);
    directionsRef.current = dirs;
    setDirections(dirs);
    applyTheme(dirs[0]);

    stepRef.current = 6;
    setFlowStep(6);
    addMsg({ id: makeId(), type: 'ai', html: `Here are <b>3 directions</b> for <b>${esc(contentRef.current.name)}</b>:` });
    addMsg({ id: makeId(), type: 'dirs' });

    setTimeout(() => {
      addMsg({ id: makeId(), type: 'ai', html: `Live in preview ✦ Tap a direction to compare, or type a change below.` });
      stepRef.current = 7;
      setFlowStep(7);
      setInputPlaceholder('"make it darker", "purple accent", "serif font"…');
      setInputEnabled(true);
      scrollChat();
    }, 700);
  }

  function handleSend() {
    const val = chatInput.trim();
    if (!val || !inputEnabled) return;
    setChatInput('');

    if (stepRef.current === 1) {
      // name
      contentRef.current.name = val;
      addMsg({ id: makeId(), type: 'user', text: val });
      if (roleRef.current === 'artist') {
        stepRef.current = 2;
        setFlowStep(2);
        setTimeout(() => {
          addMsg({ id: makeId(), type: 'ai', html: 'What genre best describes your sound?' });
          const gMsgId = makeId();
          addMsg({
            id: gMsgId, type: 'chips', kind: 'genre',
            chips: ['R&B / Soul', 'Hip-Hop', 'Pop', 'Rock / Indie', 'Electronic', 'Jazz / Blues', 'Folk / Acoustic', 'Other'].map(g => ({ value: g, label: g })),
          });
          setInputPlaceholder('Select a genre above…');
          setInputEnabled(false);
          scrollChat();
        }, 380);
      } else {
        stepRef.current = 4;
        setFlowStep(4);
        setTimeout(() => {
          addMsg({ id: makeId(), type: 'ai', html: 'Describe your vibe in a few words:' });
          const vMsgId = makeId();
          addMsg({
            id: vMsgId, type: 'chips', kind: 'vibe',
            chips: (VIBE_CHIPS[roleRef.current as Role] as string[]).map((v: string) => ({ value: v, label: v })),
          });
          setInputPlaceholder(`e.g. "${(ROLES[roleRef.current as Role] as RoleDef).defaultVibe}"`);
          setInputEnabled(true);
          scrollChat();
        }, 380);
      }
    } else if (stepRef.current === 4) {
      addMsg({ id: makeId(), type: 'user', text: val });
      doGenerate(val);
    } else if (stepRef.current === 7) {
      addMsg({ id: makeId(), type: 'user', text: val });
      doRefine(val);
    }
  }

  function doRefine(ins: string) {
    if (!themeRef.current) return;
    if (IMAGE_RE.test(ins)) {
      addMsg({ id: makeId(), type: 'ai', html: "I can't generate images — upload your own in <b>📷 Photos</b>, or browse free backgrounds in <b>🖼 Library</b>." });
      setInputPlaceholder('"make it darker", "purple accent", "serif font"…');
      setInputEnabled(true);
      scrollChat();
      return;
    }
    const next = heuristicRefine(ins, themeRef.current, contentRef.current);
    applyTheme(next);
    addMsg({ id: makeId(), type: 'ai', html: `Done — updated: <b>${esc(ins)}</b>` });
    setInputPlaceholder('"make it darker", "purple accent", "serif font"…');
    setInputEnabled(true);
    scrollChat();
  }

  /* ── APPLY THEME ── */
  const applyTheme = useCallback((t: Theme) => {
    const content = contentRef.current;
    if (t.tagline) content.tagline = t.tagline;
    if (t.bio) content.bio = t.bio;
    themeRef.current = t;
    setTheme(t);
    setUrlName(toSlug(content.name));

    const root = pageRootRef.current;
    const scroll = pageScrollRef.current;
    if (!root || !scroll) return;

    const p = t.palette; const f = FONTS[t.font] || FONTS.editorial;
    const safeHeroUrl = t.heroUrl?.startsWith('blob:') ? t.heroUrl : '';
    const map: Record<string, string> = {
      '--p-bg': p.bg, '--p-surface': p.surface, '--p-line': p.line, '--p-ink': p.ink,
      '--p-ink2': p.ink2, '--p-accent': p.accent, '--p-accent2': p.accent2,
      '--p-display': f.display, '--p-body': f.body, '--p-label': f.label, '--p-serif': f.accent,
      '--p-dweight': String(f.dWeight), '--p-tight': f.tight, '--p-radius': '14px',
      '--p-hero-url': safeHeroUrl ? `url(${safeHeroUrl})` : 'none',
    };
    for (const k in map) root.style.setProperty(k, map[k]);
    root.dataset.mood = t.mood;
    root.dataset.layout = t.layout;

    scroll.innerHTML = renderPreviewHTML(content, t);

    scroll.querySelectorAll<HTMLElement>('[data-edit]').forEach((el: HTMLElement) => {
      const field = el.dataset.edit;
      const single = field !== 'bio';
      el.addEventListener('blur', () => {
        const v = (el.textContent || '').trim();
        if (field === 'name') { content.name = v; setUrlName(toSlug(v)); }
        else if (field === 'tagline') content.tagline = v;
        else if (field === 'bio') content.bio = v;
      });
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && single) { e.preventDefault(); el.blur(); }
      });
    });
  }, []);

  function resetAll() {
    startFlow();
    if (pageScrollRef.current) pageScrollRef.current.innerHTML = '';
    if (pageRootRef.current) {
      pageRootRef.current.dataset.mood = 'dark';
      pageRootRef.current.dataset.layout = 'spotlight';
    }
    setUrlName('you');
    setPubLabel('↗ Publish page');
  }

  function onPublish() {
    if (!themeRef.current) return toast('Generate your page first!');
    toast(`✓ Published to ihype.fm/${toSlug(contentRef.current.name)}`);
    setPubLabel('✓ Published');
    if (pubTimer.current) clearTimeout(pubTimer.current);
    pubTimer.current = setTimeout(() => setPubLabel('↗ Publish page'), 2800);
  }

  /* ── RENDER CHIP ROW ── */
  function ChatChipRow({ msg }: { msg: Extract<ChatMsg, { type: 'chips' }> }) {
    return (
      <div className="ps2-chips-wrap">
        <div className="ps2-av">✦</div>
        <div className="ps2-chips-row">
          {msg.chips.map(c => (
            <button
              key={c.value}
              className={'ps2-chip' + (msg.answered === c.value ? ' picked' : '')}
              disabled={!!msg.answered}
              onClick={() => {
                if (msg.answered) return;
                if (msg.kind === 'role') handleRoleChip(msg.id, c.value as Role);
                else if (msg.kind === 'genre') handleGenreChip(msg.id, c.value);
                else if (msg.kind === 'stage') handleStageChip(msg.id, c.value);
                else if (msg.kind === 'vibe') handleVibeChip(msg.id, c.value);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── RENDER DIRECTION CARDS ── */
  function DirCards() {
    return (
      <div className="ps2-dirs-wrap">
        <div className="ps2-av">✦</div>
        <div className="ps2-dirs-row">
          {directions.map((d: Theme, i: number) => {
            const p = d.palette;
            const active = themeRef.current?.name === d.name;
            return (
              <button
                key={d.name + i}
                className={'ps2-dcard' + (active ? ' on' : '')}
                onClick={() => { applyTheme(directions[i]); toast(`Applied: ${d.name}`); }}
              >
                <div className="ps2-dp" style={{ background: p.bg }}>
                  <div className="ps2-dp-bar" style={{ background: p.accent }} />
                  <div className="ps2-dp-dot" style={{ background: p.accent2 }} />
                  <div className="ps2-dp-lines">
                    <i style={{ background: p.ink }} />
                    <i style={{ background: p.ink2 }} />
                  </div>
                </div>
                <div className="ps2-dm">
                  <b>{d.name}</b>
                  <span>{FONTS[d.font].name} · {d.layout}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── MAIN RENDER ── */
  return (
    <div className="ps2-app">
      {/* ── CHAT PANEL ── */}
      <div className="ps2-chat">
        <div className="ps2-chat-hd">
          <div className="ps2-chat-icon">✦</div>
          <div>
            <div className="ps2-chat-title">AI Page Builder</div>
          </div>
          <div className="ps2-chat-sub">POWERED BY CLAUDE</div>
          <button className="ps2-new-btn" onClick={resetAll}>↺ New</button>
        </div>

        <div className="ps2-msgs" ref={msgsRef}>
          {chatMsgs.map((msg: ChatMsg) => {
            if (msg.type === 'ai') return (
              <div key={msg.id} className="ps2-msg ai">
                <div className="ps2-av">✦</div>
                <div className="ps2-bub" dangerouslySetInnerHTML={{ __html: msg.html }} />
              </div>
            );
            if (msg.type === 'user') return (
              <div key={msg.id} className="ps2-msg user">
                <div className="ps2-bub">{msg.text}</div>
              </div>
            );
            if (msg.type === 'chips') return <ChatChipRow key={msg.id} msg={msg as Extract<ChatMsg, { type: 'chips' }>} />;
            if (msg.type === 'dirs' && directions.length > 0) return <DirCards key={msg.id} />;
            return null;
          })}
          {showTyping && (
            <div className="ps2-typing-wrap">
              <div className="ps2-av">✦</div>
              <div className="ps2-dots"><span /><span /><span /></div>
            </div>
          )}
        </div>

        <div className="ps2-chat-ft">
          <div className="ps2-in-row">
            <input
              className="ps2-in"
              value={chatInput}
              placeholder={inputPlaceholder}
              disabled={!inputEnabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            />
            <button
              className="ps2-send-btn"
              disabled={!inputEnabled || !chatInput.trim()}
              onClick={handleSend}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="ps2-ast-strip">
            <button className="ps2-ab ps2-ab-prime">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="4" y="10" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="4" y="16" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.7"/></svg>
              Sections
            </button>
            <button className="ps2-ab">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M3 16l5-5 4 4 3-3 6 5" stroke="currentColor" strokeWidth="1.7"/></svg>
              Photos
            </button>
            <button className="ps2-ab">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.7"/><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.7"/><circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.7"/></svg>
              Music
            </button>
            <button className="ps2-ab">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              Links
            </button>
            <button className="ps2-ab">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.7"/></svg>
              Library
            </button>
          </div>
        </div>
      </div>

      {/* ── STAGE ── */}
      <main className={'ps2-stage' + (generating ? ' gen' : '')} data-d={device}>
        <div className="ps2-stbar">
          <div className="ps2-url-pill">🔒 ihype.fm/<b>{urlName}</b></div>
          <div className="ps2-stage-r">
            <div className="ps2-dev-seg">
              <button className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Desktop
              </button>
              <button className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Mobile
              </button>
            </div>
            <div className="ps2-theme-tag">THEME · <b>{theme?.name ?? '—'}</b></div>
            <button className="ps2-epk-btn" onClick={() => toast('EPK export — coming soon')}>⎘ Export EPK</button>
            <button className="ps2-pub-btn" onClick={onPublish}>{pubLabel}</button>
          </div>
        </div>

        <div className="ps2-vp">
          <div id="ps2-pr" ref={pageRootRef} data-mood="dark" data-layout="spotlight">
            <div id="ps2-ps" ref={pageScrollRef} style={{ display: theme ? 'block' : 'none' }} />
            {!theme && (
              <div className="ps2-empty">
                <div className="ps2-spark">✦</div>
                <h3>Your page lives here</h3>
                <p>Chat with the AI to describe your vibe — a full page appears in seconds, no design skills needed.</p>
                <div className="ps2-hint">START IN THE CHAT ←</div>
              </div>
            )}
          </div>
        </div>

        <div className={'ps2-toast' + (toastOn ? ' show' : '')}>{toastMsg}</div>
      </main>
    </div>
  );
}
