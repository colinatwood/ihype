import { parseShowProductionPlan, sumProductionPlanDurationSecs } from '@/lib/show-composer';

export type HypePositionBucket = 'early' | 'mid' | 'late';

/** Which third of a show's runtime a hype landed in. Null if duration is unknown. */
export function bucketHypePosition(positionSeconds: number, durationSeconds: number): HypePositionBucket | null {
  if (durationSeconds <= 0) return null;
  const pct = positionSeconds / durationSeconds;
  if (pct < 1 / 3) return 'early';
  if (pct < 2 / 3) return 'mid';
  return 'late';
}

/** Same trackDur > planDur > 3600-fallback formula RadioHome.tsx uses to render show length. */
export function computeShowDurationSecs(show: {
  radioTracks: { durationSecs: number | null }[];
  productionPlan: unknown;
}): number {
  const trackDur = show.radioTracks.reduce((sum, t) => sum + (t.durationSecs ?? 0), 0);
  if (trackDur > 0) return trackDur;
  const plan = parseShowProductionPlan(show.productionPlan);
  const planDur = plan ? sumProductionPlanDurationSecs(plan) : 0;
  if (planDur > 0) return planDur;
  return 3600;
}
