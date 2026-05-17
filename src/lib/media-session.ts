export function updateMediaSession(state: { trackTitle: string; artistName: string } | null) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  if (!state) {
    navigator.mediaSession.metadata = null;
    return;
  }
  navigator.mediaSession.metadata = new MediaMetadata({
    title: state.trackTitle,
    artist: state.artistName,
    album: 'iHYPE',
    artwork: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  });
}
