import Link from 'next/link';
import type { ReactNode } from 'react';
import { ShowCard } from '@/components/ShowCard';

type DiscoverShow = Parameters<typeof ShowCard>[0]['show'];

type DiscoverStatItem = {
  label: string;
  value: string | number;
};

type DiscoverOpportunity = {
  title: string;
  summary: string;
  detail: string;
};

function DiscoverModuleShell({
  badge,
  title,
  description,
  children
}: {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="panel discover-module-panel">
        <div className="discover-module-header">
          <div>
            <div className="badge">{badge}</div>
            <h2>{title}</h2>
          </div>
          <p className="meta">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function DiscoverStatsPanel({
  badge,
  title,
  description,
  stats,
  highlights
}: {
  badge: string;
  title: string;
  description: string;
  stats: DiscoverStatItem[];
  highlights?: string[];
}) {
  return (
    <DiscoverModuleShell badge={badge} description={description} title={title}>
      <div className="discover-stat-grid">
        {stats.map((stat) => (
          <div className="discover-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      {highlights?.length ? (
        <div className="discover-market-strip" aria-label="Top focus markets">
          {highlights.map((highlight) => (
            <span className="discover-market-pill" key={highlight}>
              {highlight}
            </span>
          ))}
        </div>
      ) : null}
    </DiscoverModuleShell>
  );
}

export function DiscoverRecommendationPanel({
  badge,
  title,
  description,
  opportunities
}: {
  badge: string;
  title: string;
  description: string;
  opportunities: DiscoverOpportunity[];
}) {
  return (
    <DiscoverModuleShell badge={badge} description={description} title={title}>
      <div className="discover-recommendation-grid">
        {opportunities.map((opportunity) => (
          <article className="discover-recommendation-card" key={opportunity.title}>
            <strong>{opportunity.title}</strong>
            <p>{opportunity.summary}</p>
            <span>{opportunity.detail}</span>
          </article>
        ))}
      </div>
    </DiscoverModuleShell>
  );
}

export function DiscoverTicketHubPanel({
  shows
}: {
  shows: DiscoverShow[];
}) {
  return (
    <DiscoverModuleShell
      badge="Ticket hub"
      description="Track ticketed shows that are open now, moving fast, or worth watching next."
      title="Ticketed shows in motion"
    >
      {shows.length ? (
        <div className="grid grid-2">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      ) : (
        <div className="empty">No ticketed shows are open right now.</div>
      )}
    </DiscoverModuleShell>
  );
}

export function DiscoverCreatorPanel({
  badge,
  title,
  description,
  actionHref,
  actionLabel,
  children
}: {
  badge: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <DiscoverModuleShell badge={badge} description={description} title={title}>
      <div className="discover-creator-content">{children}</div>
      {actionHref && actionLabel ? (
        <div className="cta-row">
          <Link className="button secondary" href={actionHref}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </DiscoverModuleShell>
  );
}
