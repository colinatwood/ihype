export function calculateFanLevel(fullSongListens: number, fullShowListens: number) {
  return Math.max(1, fullSongListens + fullShowListens);
}
