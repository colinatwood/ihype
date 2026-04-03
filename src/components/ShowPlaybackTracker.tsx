'use client';

import { useRef, type SyntheticEvent } from 'react';

type ShowPlaybackTrackerProps = {
  showId: string;
  showSlug: string;
  title: string;
  playbackUrl: string;
  autoPlay?: boolean;
  isLive?: boolean;
};

export function ShowPlaybackTracker({
  showId,
  showSlug,
  title,
  playbackUrl,
  autoPlay = false,
  isLive = false
}: ShowPlaybackTrackerProps) {
  const hasRecordedRef = useRef(false);

  async function recordFullListen() {
    if (hasRecordedRef.current || isLive) {
      return;
    }

    hasRecordedRef.current = true;

    try {
      await fetch('/api/show-listens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          title,
          showSlug,
          playbackUrl
        })
      });
    } catch {
      // Keep playback resilient if listen tracking fails.
    }
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    if (isLive) {
      return;
    }

    const media = event.currentTarget;
    if (!Number.isFinite(media.duration) || media.duration <= 0) {
      return;
    }

    if (media.currentTime / media.duration >= 0.9) {
      void recordFullListen();
    }
  }

  return (
    <video
      autoPlay={autoPlay}
      className="video-frame"
      controls
      muted={isLive}
      onEnded={() => {
        void recordFullListen();
      }}
      onTimeUpdate={handleTimeUpdate}
      playsInline
    >
      <source src={playbackUrl} type="application/x-mpegURL" />
    </video>
  );
}
