import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
  icon?: string;
}

/**
 * Shared empty-state card used across public directory and discover surfaces.
 * Renders a dashed panel with a short message and a single action button.
 */
export function EmptyState({ title, body, ctaLabel, ctaHref, icon }: EmptyStateProps) {
  return (
    <div className="empty">
      {icon && <span className="empty-icon">{icon}</span>}
      <span className="empty-title">{title}</span>
      {body && <p>{body}</p>}
      <Link className="button small secondary" href={ctaHref}>
        {ctaLabel}
      </Link>
    </div>
  );
}
