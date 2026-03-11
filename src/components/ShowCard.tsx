import Link from 'next/link';
import { getShowVisibilitySignals } from '@/lib/integrity';
import { formatCurrencyFromCents } from '@/lib/ticketing';
import { formatShowTime } from '@/lib/utils';

type ShowCardShow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELED';
  startsAt: Date;
  hypeCount: number;
  isTicketed: boolean;
  ticketPriceCents: number;
  ticketCapacity: number | null;
  ticketsSoldCount: number;
  tags: string[];
  venueProfile: {
    name: string;
    city: string | null;
  } | null;
  headlinerProfile: {
    name: string;
  } | null;
};

export function ShowCard({ show }: { show: ShowCardShow }) {
  const visibility = getShowVisibilitySignals(show);

  return (
    <article className="card show-card">
      <div className="show-art">{show.status === 'LIVE' ? 'LIVE NOW' : 'STREAM SHOW'}</div>
      <div>
        <div className="badge">{show.status}</div>
        <h3>{show.title}</h3>
        <p className="meta">
          {formatShowTime(show.startsAt)}
          {show.venueProfile ? ` | ${show.venueProfile.name}` : ''}
          {show.headlinerProfile ? ` | ${show.headlinerProfile.name}` : ''}
        </p>
        <p>{show.description}</p>
        {show.isTicketed ? (
          <p className="meta">
            Tickets {formatCurrencyFromCents(show.ticketPriceCents)}
            {show.ticketCapacity ? ` | ${show.ticketsSoldCount}/${show.ticketCapacity} sold` : ` | ${show.ticketsSoldCount} sold`}
          </p>
        ) : null}
        <div className="tag-row">
          {show.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="explanation-card">
          <div className="meta">Why you&apos;re seeing this</div>
          <div className="signal-grid compact">
            {visibility.signals.map((signal) => (
              <div className="signal-card" key={signal.label}>
                <strong>{signal.label}</strong>
                <span>{signal.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="cta-row">
        <Link className="button small" href={`/shows/${show.slug}`}>
          Watch show
        </Link>
      </div>
    </article>
  );
}
