'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useMediaPlayer, type MediaTrack } from '@/components/GlobalMediaPlayer';

type SavedTrack = {
  hexId: string;
  title: string;
  notes: string | null;
  url: string;
  artistName: string;
  artistSlug: string;
  artworkUrl: string | null;
  savedAt: Date;
};

export function SavedTracksPlaylist({ tracks }: { tracks: SavedTrack[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlayback } = useMediaPlayer();

  const queue = useMemo<MediaTrack[]>(
    () =>
      tracks.map((t) => ({
        id: `saved-${t.hexId}`,
        title: t.title,
        artistName: t.artistName,
        url: t.url,
        mediaId: t.hexId,
        artistProfileSlug: t.artistSlug,
        notes: t.notes,
        artworkUrl: t.artworkUrl
      })),
    [tracks]
  );

  return (
    <div className="artist-media-list">
      <div style={{ marginBottom: '0.75rem' }}>
        <button
          className="button small"
          onClick={() => { if (queue[0]) playTrack(queue[0], queue); }}
          type="button"
        >
          Play all
        </button>
      </div>
      {queue.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentAndPlaying = isCurrentTrack && isPlaying;
        const saved = tracks[index];

        return (
          <article className={isCurrentTrack ? 'artist-media-card active' : 'artist-media-card'} key={track.id}>
            <div className="artist-media-card-copy">
              <span className="artist-media-index">{String(index + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1 }}>
                <strong>{track.title}</strong>
                <p className="meta">
                  <Link href={`/artists/${saved.artistSlug}`}>{saved.artistName}</Link>
                  {track.notes ? ` | ${track.notes}` : ''}
                </p>
                <p className="meta" style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                  Saved {new Date(saved.savedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="artist-media-actions">
              <button
                className="button small"
                onClick={() => { if (isCurrentTrack) { togglePlayback(); return; } playTrack(track, queue); }}
                type="button"
              >
                {isCurrentAndPlaying ? 'Pause' : isCurrentTrack ? 'Resume' : 'Play'}
              </button>
              <Link className="button small secondary" href={`/artists/${saved.artistSlug}`}>
                Artist page
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
