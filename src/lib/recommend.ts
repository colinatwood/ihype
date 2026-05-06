// Weights for the recommendation scoring model (taste + geo + social + momentum = 1.0)
export const RECOMMEND_WEIGHTS = { taste: 0.40, geo: 0.25, social: 0.20, momentum: 0.15 } as const;

export type RecommendScores = {
  taste: number | null;    // genre overlap with viewer; null when viewer has no genres
  geo: number | null;      // location tier match; null when viewer has no location
  social: number;          // log-normalized hypeCount — always real
  momentum: number;        // hype velocity (hypes/day) normalized — always real
  final: number;           // weighted average of available signals
};

export type ViewerRecommendContext = {
  genres: string[];
  stateRegion: string | null;
  country: string | null;
};

export function computeGeoTier(
  viewerState: string | null,
  viewerCountry: string | null,
  profileState: string | null,
  profileCountry: string | null
): number | null {
  if (!viewerState && !viewerCountry) return null;
  if (!profileState && !profileCountry) return null;
  if (viewerState && profileState && viewerState.toLowerCase() === profileState.toLowerCase()) return 1.0;
  if (viewerCountry && profileCountry && viewerCountry.toLowerCase() === profileCountry.toLowerCase()) return 0.55;
  return 0.20;
}

export function computeTasteScore(viewerGenres: string[], profileGenres: string[]): number | null {
  if (!viewerGenres.length) return null;
  if (!profileGenres.length) return 0;
  const vSet = new Set(viewerGenres.map(g => g.toLowerCase()));
  const overlap = profileGenres.filter(g => vSet.has(g.toLowerCase())).length;
  return Math.min(1, overlap / Math.max(1, viewerGenres.length));
}

export function computeFinalScore(signals: Omit<RecommendScores, 'final'>): number {
  let weightedSum = 0;
  let totalWeight = 0;
  const entries: [keyof typeof RECOMMEND_WEIGHTS, number | null][] = [
    ['taste',    signals.taste],
    ['geo',      signals.geo],
    ['social',   signals.social],
    ['momentum', signals.momentum],
  ];
  for (const [key, val] of entries) {
    if (val !== null) {
      weightedSum += val * RECOMMEND_WEIGHTS[key];
      totalWeight  += RECOMMEND_WEIGHTS[key];
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function scoreProfiles<T extends {
  hypeCount: number;
  stateRegion: string | null;
  country: string | null;
  genres: string[];
  createdAt: Date;
}>(profiles: T[], viewer: ViewerRecommendContext): Array<T & { _scores: RecommendScores }> {
  if (!profiles.length) return [];
  const maxHype = Math.max(...profiles.map(p => p.hypeCount), 1);
  const now = Date.now();
  const momentumRaw = profiles.map(p => {
    const ageDays = Math.max(1, (now - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return (p.hypeCount + 1) / (ageDays + 1);
  });
  const maxMomentum = Math.max(...momentumRaw, 1);
  return profiles.map((p, i) => {
    const social   = Math.log1p(p.hypeCount) / Math.log1p(maxHype);
    const momentum = momentumRaw[i] / maxMomentum;
    const geo      = computeGeoTier(viewer.stateRegion, viewer.country, p.stateRegion, p.country);
    const taste    = computeTasteScore(viewer.genres, p.genres);
    const signals  = { social, momentum, geo, taste };
    return { ...p, _scores: { ...signals, final: computeFinalScore(signals) } };
  });
}
