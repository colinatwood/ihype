import Link from 'next/link';
import type { ReactNode } from 'react';

const BUILT_IN_SVGS: Record<string, ReactNode> = {
  '🗓️': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48, color: '#ff5029', opacity: 0.7 }}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  '📼': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48, color: '#ff5029', opacity: 0.7 }}>
      <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><path d="M10 12h4"/>
    </svg>
  ),
};

interface EmptyStateProps {
  title: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: string;
}

export function EmptyState({ title, body, ctaLabel, ctaHref, icon }: EmptyStateProps) {
  const svgIcon = icon ? BUILT_IN_SVGS[icon] : null;
  return (
    <div className="empty">
      {svgIcon
        ? <span className="empty-icon">{svgIcon}</span>
        : icon && <span className="empty-icon">{icon}</span>}
      <span className="empty-title">{title}</span>
      {body && <p>{body}</p>}
      <Link className="button small secondary" href={ctaHref}>
        {ctaLabel}
      </Link>
    </div>
  );
}
