'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type QueueItem = {
  mediaId: string;
  title: string;
  artistName: string;
};

type QueueContextType = {
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  addToQueue: (item: QueueItem) => void;
  next: () => void;
  prev: () => void;
  play: (index: number) => void;
  clear: () => void;
  toggle: () => void;
};

const QueueContext = createContext<QueueContextType | null>(null);

export function MediaQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const addToQueue = useCallback((item: QueueItem) => {
    setQueue((prev) => [...prev, item]);
    // Persist to API
    fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId: item.mediaId })
    }).catch(() => {});
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, queue.length - 1));
  }, [queue.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const play = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    fetch('/api/queue', { method: 'DELETE' }).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  return (
    <QueueContext.Provider value={{ queue, currentIndex, isPlaying, addToQueue, next, prev, play, clear, toggle }}>
      {children}
      {queue.length > 0 && <MiniPlayerBar />}
    </QueueContext.Provider>
  );
}

export function useMediaQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useMediaQueue must be used within MediaQueueProvider');
  return ctx;
}

function MiniPlayerBar() {
  const { queue, currentIndex, isPlaying, next, prev, clear, toggle } = useMediaQueue();
  const current = queue[currentIndex];
  if (!current) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        zIndex: 1000
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current.title}
        </p>
        <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-2)', margin: 0 }}>
          {current.artistName}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="button secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={prev} type="button" disabled={currentIndex === 0}>
          ‹ Prev
        </button>
        <button className="button" style={{ padding: '4px 14px', fontSize: 12 }} onClick={toggle} type="button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="button secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={next} type="button" disabled={currentIndex === queue.length - 1}>
          Next ›
        </button>
        <span style={{ fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--ink-3)' }}>
          {currentIndex + 1}/{queue.length}
        </span>
        <button className="button secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={clear} type="button">
          Clear
        </button>
      </div>
    </div>
  );
}
