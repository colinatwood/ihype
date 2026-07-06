'use client';

import { ReactNode, useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { acquireScrollLock } from '@/lib/scrollLock';
import { resolveDragCommit } from '@/lib/mobileShell';

export type QuickGridItem = {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  icon: ReactNode;
  /** For server-component pages: navigate here instead of calling onSelect. */
  href?: string;
};

/**
 * Mobile-only "home" for a tabbed page: a full-screen search trigger +
 * quick-access button grid that replaces the desktop tab strip on phones.
 * Desktop is unaffected — see .mqg-* rules in globals.css, all gated
 * behind the same 768px breakpoint the rest of the mobile shell uses.
 *
 * Works for both client-state pages (pass onSelect) and server-component
 * pages that switch tabs via the URL (pass href on each item / searchHref).
 */
export function MobileQuickGrid({
  active,
  items,
  onSelect,
  searchPlaceholder,
  onSearchTap,
  searchHref,
  onSwipeSection,
}: {
  active: boolean;
  items: QuickGridItem[];
  onSelect?: (id: string) => void;
  searchPlaceholder?: string;
  onSearchTap?: () => void;
  searchHref?: string;
  /** Optional: called with 'next'/'prev' on a completed horizontal swipe. This overlay is portaled to document.body, outside MobileAppShell's own carousel drag-handler DOM subtree, so it needs its own gesture detection to let swiping work while a section's grid/home view (not just its drilled-in content) is showing. */
  onSwipeSection?: (direction: 'next' | 'prev') => void;
}) {
  const cells: (QuickGridItem | null)[] = [...items];
  while (cells.length < 4) cells.push(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active) return;
    return acquireScrollLock();
  }, [active]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchAxis = useRef<'x' | 'y' | null>(null);

  function handleTouchStart(e: ReactTouchEvent<HTMLDivElement>) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchAxis.current = null;
  }
  function handleTouchMove(e: ReactTouchEvent<HTMLDivElement>) {
    if (!touchStart.current || touchAxis.current !== null) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      touchAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
  }
  function handleTouchEnd(e: ReactTouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const axis = touchAxis.current;
    touchStart.current = null;
    touchAxis.current = null;
    if (!start || axis !== 'x' || !onSwipeSection) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const width = overlayRef.current?.getBoundingClientRect().width ?? 0;
    const commit = resolveDragCommit(dx, width);
    if (commit) onSwipeSection(commit);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={`mqg-overlay${active ? ' is-active' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={overlayRef}
    >
      {searchPlaceholder && (searchHref ? (
        <Link className="mqg-search" href={searchHref}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          {searchPlaceholder}
        </Link>
      ) : onSearchTap ? (
        <button className="mqg-search" onClick={onSearchTap} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          {searchPlaceholder}
        </button>
      ) : null)}
      <div className="mqg-grid">
        {cells.map((item, i) =>
          item ? (
            item.href ? (
              <Link className="mqg-btn" href={item.href} key={item.id} style={{ background: `${item.color}12` }}>
                <span className="mqg-icon" style={{ background: `${item.color}26`, color: item.color }}>
                  {item.icon}
                </span>
                <span className="mqg-label">{item.label}</span>
                <span className="mqg-sublabel">{item.sublabel}</span>
              </Link>
            ) : (
              <button
                className="mqg-btn"
                key={item.id}
                onClick={() => onSelect?.(item.id)}
                style={{ background: `${item.color}12` }}
                type="button"
              >
                <span className="mqg-icon" style={{ background: `${item.color}26`, color: item.color }}>
                  {item.icon}
                </span>
                <span className="mqg-label">{item.label}</span>
                <span className="mqg-sublabel">{item.sublabel}</span>
              </button>
            )
          ) : (
            <span aria-hidden="true" className="mqg-btn mqg-spacer" key={`spacer-${i}`} />
          )
        )}
      </div>
    </div>,
    document.body
  );
}
