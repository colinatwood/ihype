'use client';

import { useMemo } from 'react';
import { useMediaPlayer, type MediaTrack } from '@/components/GlobalMediaPlayer';
import type { ArtistMediaEntry } from '@/lib/media';

type ArtistMediaPlaylistProps = {
  artistName: string;
  artistSlug: string;
  artworkUrl: string | null;
  entries: ArtistMediaEntry[];
};

export function ArtistMediaPlaylist({
  artistName,
  artistSlug,
  artworkUrl,
  entries
}: ArtistMediaPlaylistProps) {
  const { currentTrack, isPlaying, playTrack, togglePlayback } = useMediaPlayer();

  const queue = useMemo<MediaTrack[]>(
    () =>
      entries.map((entry) => ({
        id: `${artistSlug}-${entry.id}`,
        title: entry.title,
        artistName,
        url: entry.url,
        notes: entry.notes,
        artworkUrl
      })),
    [artistName, artistSlug, artworkUrl, entries]
  );

  return (
    <div className="artist-media-list">
      {queue.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentAndPlaying = isCurrentTrack && isPlaying;

        return (
          <article className={isCurrentTrack ? 'artist-media-card active' : 'artist-media-card'} key={track.id}>
            <div className="artist-media-card-copy">
              <span className="artist-media-index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{track.title}</strong>
                <p className="meta">
                  {artistName}
                  {track.notes ? ` | ${track.notes}` : ''}
                </p>
              </div>
            </div>

            <div className="artist-media-actions">
              <button
                className="button small"
                onClick={() => {
                  if (isCurrentTrack) {
                    togglePlayback();
                    return;
                  }

                  playTrack(track, queue);
                }}
                type="button"
              >
                {isCurrentAndPlaying ? 'Pause' : isCurrentTrack ? 'Resume' : 'Play in dock'}
              </button>
              <a className="button small secondary" href={track.url} rel="noreferrer" target="_blank">
                Open audio
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
