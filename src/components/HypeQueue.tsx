'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HypeButton } from '@/components/HypeButton';
import { useMediaPlayer, type MediaTrack } from '@/components/GlobalMediaPlayer';
import type { HypeQueueItem } from '@/lib/hype-queue';

const filters: Array<{ id: HypeQueueItem['category'] | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'local', label: 'More local' },
  { id: 'new', label: 'More new' },
  { id: 'similar', label: 'More like this' },
  { id: 'wildcard', label: 'Surprise me' }
];

function toTrack(item: HypeQueueItem): MediaTrack {
  return {
    id: item.id,
    title: item.title,
    artistName: item.artistName,
    url: item.url,
    mediaId: item.mediaId,
    artistProfileSlug: item.artistSlug,
    notes: item.notes,
    artworkUrl: item.artworkUrl
  };
}

export function HypeQueue({ items }: { items: HypeQueueItem[] }) {
  const { playTrack } = useMediaPlayer();
  const [activeFilter, setActiveFilter] = useState<HypeQueueItem['category'] | 'all'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const visibleItems = items.filter(
    (item) => !dismissedIds.has(item.id) && (activeFilter === 'all' || item.category === activeFilter)
  );
  const queue = useMemo<MediaTrack[]>(() => visibleItems.map(toTrack), [visibleItems]);

  if (!items.length) {
    return (
      <div className="hype-queue-empty">
        <strong>HYPE Queue needs artist media.</strong>
        <p>As artists upload songs, this space becomes the guided listening queue that feeds the HYPE engine.</p>
      </div>
    );
  }

  return (
    <section className="hype-queue" aria-labelledby="hype-queue-title">
      <div className="hype-queue-head">
        <div>
          <div className="badge">HYPE Queue</div>
          <h3 id="hype-queue-title">Listen where your HYPE can move the signal.</h3>
        </div>
        <p className="meta">Every play is designed to create useful full-listen, save, and hype data.</p>
      </div>

      <div className="hype-queue-filters" aria-label="Tune HYPE Queue">
        {filters.map((filter) => (
          <button
            className={filter.id === activeFilter ? 'hype-queue-filter active' : 'hype-queue-filter'}
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="hype-queue-grid">
        {visibleItems.map((item) => (
          <article className={`hype-queue-card hype-queue-card-${item.category}`} key={item.id}>
            <div className="hype-queue-card-topline">
              <span>{item.slotLabel}</span>
              <small>{item.artistHypeCount ?? 0} hype</small>
            </div>
            <strong>{item.title}</strong>
            <p>{item.artistName}</p>
            <div className="hype-queue-reasons">
              {item.reasonChips.slice(0, 3).map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <p className="hype-queue-why">{item.whyNow}</p>
            <div className="hype-queue-actions">
              <button className="button small" onClick={() => playTrack(toTrack(item), queue)} type="button">
                Play
              </button>
              <Link className="button small secondary" href={`/artists/${item.artistSlug}`}>
                Artist
              </Link>
              {item.artistProfileId ? (
                <HypeButton
                  entityLabel="artist"
                  initialCount={item.artistHypeCount ?? 0}
                  targetId={item.artistProfileId}
                  targetType="profile"
                />
              ) : null}
              <button
                className="text-link"
                onClick={() => setDismissedIds((current) => new Set(current).add(item.id))}
                type="button"
              >
                Not for me
              </button>
            </div>
          </article>
        ))}
      </div>

      {!visibleItems.length ? (
        <div className="hype-queue-empty">
          <strong>No picks in that lane yet.</strong>
          <p>Try All or Surprise me while the catalog grows.</p>
        </div>
      ) : null}
    </section>
  );
}
