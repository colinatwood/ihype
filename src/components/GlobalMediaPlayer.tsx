'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

export type MediaTrack = {
  id: string;
  title: string;
  artistName: string;
  url: string;
  notes?: string | null;
  artworkUrl?: string | null;
};

type MediaPlayerContextValue = {
  currentTrack: MediaTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: MediaTrack, queue?: MediaTrack[]) => void;
  togglePlayback: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
};

type PersistedPlayerState = {
  queue: MediaTrack[];
  currentIndex: number;
  currentTrack: MediaTrack | null;
  volume: number;
};

const STORAGE_KEY = 'ihype-global-media-player';

const MediaPlayerContext = createContext<MediaPlayerContextValue | null>(null);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<MediaTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState<MediaTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as PersistedPlayerState;
      setQueue(parsed.queue ?? []);
      setCurrentIndex(parsed.currentIndex ?? -1);
      setCurrentTrack(parsed.currentTrack ?? null);
      setVolumeState(parsed.volume ?? 0.85);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload: PersistedPlayerState = {
      queue,
      currentIndex,
      currentTrack,
      volume
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [queue, currentIndex, currentTrack, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const syncTime = () => setCurrentTime(audio.currentTime);
    const syncDuration = () => setDuration(audio.duration || 0);
    const syncPlay = () => setIsPlaying(true);
    const syncPause = () => setIsPlaying(false);
    const onEnded = () => {
      setCurrentTime(0);
      setIsPlaying(false);
      setCurrentIndex((index) => {
        if (index >= 0 && index < queue.length - 1) {
          const nextIndex = index + 1;
          setCurrentTrack(queue[nextIndex] ?? null);
          setIsPlaying(true);
          return nextIndex;
        }

        return index;
      });
    };

    audio.addEventListener('timeupdate', syncTime);
    audio.addEventListener('loadedmetadata', syncDuration);
    audio.addEventListener('play', syncPlay);
    audio.addEventListener('pause', syncPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', syncTime);
      audio.removeEventListener('loadedmetadata', syncDuration);
      audio.removeEventListener('play', syncPlay);
      audio.removeEventListener('pause', syncPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
      audio.load();
      setCurrentTime(0);
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  function playTrack(track: MediaTrack, nextQueue?: MediaTrack[]) {
    const resolvedQueue = nextQueue ?? queue;
    const nextIndex = resolvedQueue.findIndex((item) => item.id === track.id);
    setQueue(resolvedQueue);
    setCurrentIndex(nextIndex);
    setCurrentTrack(track);
    setIsPlaying(true);
  }

  function togglePlayback() {
    if (!currentTrack) {
      return;
    }

    setIsPlaying((value) => !value);
  }

  function playNext() {
    if (!queue.length) {
      return;
    }

    const nextIndex = currentIndex >= 0 && currentIndex < queue.length - 1 ? currentIndex + 1 : currentIndex;
    if (nextIndex === currentIndex) {
      return;
    }

    setCurrentIndex(nextIndex);
    setCurrentTrack(queue[nextIndex] ?? null);
    setIsPlaying(true);
  }

  function playPrevious() {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (!queue.length) {
      return;
    }

    const previousIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    if (previousIndex === currentIndex) {
      return;
    }

    setCurrentIndex(previousIndex);
    setCurrentTrack(queue[previousIndex] ?? null);
    setIsPlaying(true);
  }

  function seekTo(time: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) {
      return;
    }

    audio.currentTime = time;
    setCurrentTime(time);
  }

  function setVolume(volumeValue: number) {
    setVolumeState(volumeValue);
  }

  const contextValue = useMemo<MediaPlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      playTrack,
      togglePlayback,
      playNext,
      playPrevious,
      seekTo,
      setVolume
    }),
    [currentIndex, currentTrack, currentTime, duration, isPlaying, queue, volume]
  );

  const canGoBack = currentIndex > 0 || currentTime > 4;
  const canGoForward = currentIndex >= 0 && currentIndex < queue.length - 1;

  return (
    <MediaPlayerContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" />
      <div className="media-player-dock" role="region" aria-label="Global artist media player">
        <div className="container media-player-shell">
          <div className="media-player-summary">
            <span className="media-player-eyebrow">Artist uploads</span>
            <strong>{currentTrack?.title ?? 'Bottom media player ready'}</strong>
            <span className="media-player-caption">
              {currentTrack
                ? `${currentTrack.artistName}${currentTrack.notes ? ` | ${currentTrack.notes}` : ''}`
                : 'Open an artist page and tap Play in dock to keep listening while you browse.'}
            </span>
          </div>

          <div className="media-player-controls">
            <button
              className="media-player-button"
              disabled={!canGoBack}
              onClick={playPrevious}
              type="button"
            >
              Prev
            </button>
            <button
              className="media-player-button media-player-button-primary"
              disabled={!currentTrack}
              onClick={togglePlayback}
              type="button"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className="media-player-button"
              disabled={!canGoForward}
              onClick={playNext}
              type="button"
            >
              Next
            </button>
          </div>

          <div className="media-player-progress">
            <span>{formatTime(currentTime)}</span>
            <input
              aria-label="Playback position"
              className="media-player-range"
              max={duration || 0}
              min={0}
              onChange={(event) => seekTo(Number(event.target.value))}
              step={0.1}
              type="range"
              value={Math.min(currentTime, duration || 0)}
            />
            <span>{formatTime(duration)}</span>
          </div>

          <label className="media-player-volume">
            <span>Vol</span>
            <input
              aria-label="Playback volume"
              className="media-player-range"
              max={1}
              min={0}
              onChange={(event) => setVolume(Number(event.target.value))}
              step={0.05}
              type="range"
              value={volume}
            />
          </label>
        </div>
      </div>
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);

  if (!context) {
    throw new Error('useMediaPlayer must be used within MediaPlayerProvider');
  }

  return context;
}
