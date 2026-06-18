'use client';

import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────
export const GM_LEVELS = [
  'LISTENER', 'LURKER', 'SEEKER', 'SCOUT', 'TASTE BUD',
  'EAR', 'EAR FOR IT', 'CURATOR', 'TASTEMAKER', 'ORACLE',
] as const;

export type GmLevelName = typeof GM_LEVELS[number];

export interface GmState {
  xp: number;
  level: number;
  combo: number;
  bestCombo: number;
  streak: number;
  hyped: number;
  saved: number;
  xpEarned: number;
  questProgress: number;
  lbPts: number;
  sessionStart: number;
}

export interface XPPopup { id: number; amt: number; color: 'pink' | 'amber' | 'teal'; x: number; y: number }

interface GmCtx {
  state: GmState;
  popups: XPPopup[];
  showLevelUp: boolean;
  showCombo: number | null;
  addXP: (amt: number, color?: XPPopup['color'], srcEl?: HTMLElement | null) => void;
  onHype: (srcEl?: HTMLElement | null) => void;
  onSave: (srcEl?: HTMLElement | null) => void;
  onSkip: () => void;
  dismissLevelUp: () => void;
}

const GamificationContext = createContext<GmCtx | null>(null);

const STORAGE_KEY = 'ihype-gm-v1';
const XP_PER_LEVEL = 1000;
const QUEST_TARGET = 5;

function loadState(): GmState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultState();
}

function defaultState(): GmState {
  return {
    xp: 420, level: 7, combo: 0, bestCombo: 0,
    streak: 12, hyped: 0, saved: 0, xpEarned: 0,
    questProgress: 0, lbPts: 1820, sessionStart: Date.now(),
  };
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GmState>(defaultState);
  const [popups, setPopups] = useState<XPPopup[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showCombo, setShowCombo] = useState<number | null>(null);
  const popupIdRef = useRef(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = loadState();
    setState({ ...saved, combo: 0, xpEarned: 0, hyped: 0, saved: 0, questProgress: 0, sessionStart: Date.now() });
  }, []);

  // Persist non-session fields
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp: state.xp, level: state.level, streak: state.streak, lbPts: state.lbPts, bestCombo: state.bestCombo }));
    } catch { /* ignore */ }
  }, [state.xp, state.level, state.streak, state.lbPts, state.bestCombo]);

  const spawnPopup = useCallback((amt: number, color: XPPopup['color'], x: number, y: number) => {
    const id = ++popupIdRef.current;
    setPopups(prev => [...prev, { id, amt, color, x, y }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1300);
  }, []);

  const addXP = useCallback((amt: number, color: XPPopup['color'] = 'amber', srcEl?: HTMLElement | null) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (srcEl) { const r = srcEl.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + 20; }
    spawnPopup(amt, color, x, y);
    setState(prev => {
      const newXp = prev.xp + amt;
      const levelled = newXp >= XP_PER_LEVEL;
      return {
        ...prev,
        xp: levelled ? newXp - XP_PER_LEVEL : newXp,
        level: levelled ? prev.level + 1 : prev.level,
        xpEarned: prev.xpEarned + amt,
        lbPts: prev.lbPts + amt,
      };
    });
    // level-up check is triggered via useEffect below
  }, [spawnPopup]);

  // Trigger level-up overlay when level changes
  const levelRef = useRef<number | null>(null);
  useEffect(() => {
    if (levelRef.current !== null && state.level > levelRef.current) {
      setShowLevelUp(true);
    }
    levelRef.current = state.level;
  }, [state.level]);

  const triggerCombo = useCallback((combo: number) => {
    setShowCombo(combo);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setShowCombo(null), 1000);
  }, []);

  const onHype = useCallback((srcEl?: HTMLElement | null) => {
    setState(prev => {
      const combo = prev.combo + 1;
      const bestCombo = Math.max(prev.bestCombo, combo);
      const questProgress = Math.min(QUEST_TARGET, prev.questProgress + 1);
      const bonus = combo >= 10 ? 25 : combo >= 5 ? 15 : combo >= 3 ? 5 : 0;
      const xpAmt = 10 + bonus;
      const newXp = prev.xp + xpAmt;
      const levelled = newXp >= XP_PER_LEVEL;
      return {
        ...prev,
        hyped: prev.hyped + 1,
        combo,
        bestCombo,
        questProgress,
        xpEarned: prev.xpEarned + xpAmt,
        lbPts: prev.lbPts + xpAmt,
        xp: levelled ? newXp - XP_PER_LEVEL : newXp,
        level: levelled ? prev.level + 1 : prev.level,
      };
    });
    // spawn popup
    const bonus = 0; // approximated; will calculate post-setState
    spawnPopup(10 + bonus, 'pink', srcEl ? (() => { const r = srcEl.getBoundingClientRect(); return r.left + r.width / 2; })() : window.innerWidth / 2, srcEl ? (() => { const r = srcEl.getBoundingClientRect(); return r.top + 20; })() : window.innerHeight / 2);
    setState(prev => {
      if (prev.combo >= 3 && prev.combo % 3 === 0) triggerCombo(prev.combo);
      return prev;
    });
  }, [spawnPopup, triggerCombo]);

  const onSave = useCallback((srcEl?: HTMLElement | null) => {
    addXP(10, 'teal', srcEl);
    setState(prev => ({ ...prev, saved: prev.saved + 1 }));
  }, [addXP]);

  const onSkip = useCallback(() => {
    setState(prev => ({ ...prev, combo: 0 }));
  }, []);

  const dismissLevelUp = useCallback(() => setShowLevelUp(false), []);

  return (
    <GamificationContext.Provider value={{ state, popups, showLevelUp, showCombo, addXP, onHype, onSave, onSkip, dismissLevelUp }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used inside GamificationProvider');
  return ctx;
}

export function useGamificationOptional() {
  return useContext(GamificationContext);
}
