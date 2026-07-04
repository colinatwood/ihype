import { runAIJson } from '@/lib/ai';
import type { AdvertisingScope } from '@/lib/show-composer';

export type DjAdPlan = {
  scope: AdvertisingScope;
  breaksPerHour: number;
  breakDurationSecs: number;
  targetAdLoadPct: number;
  advertiserTypes: string[];
  rationale: string;
  aiGenerated: boolean;
};

export type DjAdContext = {
  name: string;
  genres: string[];
  city: string | null;
  stateRegion: string | null;
  hypeCount: number;
  crateSize: number;
  radioShowCount: number;
};

const SCOPES: AdvertisingScope[] = ['local', 'regional', 'national', 'global'];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

/**
 * Reach heuristic used when the AI binding is unavailable, and as the anchor
 * the model is asked to refine: bigger audiences justify broader ad scope.
 */
export function heuristicDjAdPlan(ctx: DjAdContext): DjAdPlan {
  const scope: AdvertisingScope =
    ctx.hypeCount >= 1000 ? 'global'
    : ctx.hypeCount >= 250 ? 'national'
    : ctx.hypeCount >= 50 ? 'regional'
    : 'local';
  return {
    scope,
    breaksPerHour: 2,
    breakDurationSecs: 90,
    targetAdLoadPct: 10,
    advertiserTypes: ['local venues', 'record labels', 'music gear brands'],
    rationale: `Based on ${ctx.hypeCount} hype and ${ctx.radioShowCount} past shows, ${scope} reach with ~10% ad load keeps listeners while filling spots.`,
    aiGenerated: false,
  };
}

type RawPlan = {
  scope?: string;
  breaksPerHour?: number;
  breakDurationSecs?: number;
  targetAdLoadPct?: number;
  advertiserTypes?: unknown[];
  rationale?: string;
};

/**
 * AI advertising recommendation for a DJ's radio shows: which ad scope to
 * sell, how often to break, how long, and which music-industry advertiser
 * types fit the show's genre and scene. All outputs are validated/clamped;
 * falls back to the reach heuristic when the AI binding is unavailable.
 */
export async function getDjAdPlan(ctx: DjAdContext): Promise<DjAdPlan> {
  const fallback = heuristicDjAdPlan(ctx);

  const result = await runAIJson<RawPlan>({
    system: `You are the advertising strategist for iHYPE.org radio shows. Only music-industry advertisers exist on the platform (venues, labels, promoters, gear and music-tech brands).
Given a DJ's profile and audience data, recommend an ad plan for their radio shows. A baseline heuristic plan is included — refine it using genre and locale, don't ignore the audience size.

Constraints:
- scope: one of "local", "regional", "national", "global" (match reach to actual audience size; small audiences sell local/regional better)
- breaksPerHour: integer 1-4
- breakDurationSecs: integer 30-180
- targetAdLoadPct: integer 5-25 (listener retention beats revenue)
- advertiserTypes: 2-4 music-industry advertiser categories tailored to the DJ's genre/scene
- rationale: one or two short sentences grounded in the provided data only

JSON shape: {"scope": string, "breaksPerHour": number, "breakDurationSecs": number, "targetAdLoadPct": number, "advertiserTypes": [string], "rationale": string}`,
    input: {
      dj: {
        name: ctx.name,
        genres: ctx.genres.slice(0, 6),
        city: ctx.city,
        region: ctx.stateRegion,
        hypeCount: ctx.hypeCount,
        freeUseCrateSize: ctx.crateSize,
        pastRadioShows: ctx.radioShowCount,
      },
      baselinePlan: {
        scope: fallback.scope,
        breaksPerHour: fallback.breaksPerHour,
        breakDurationSecs: fallback.breakDurationSecs,
        targetAdLoadPct: fallback.targetAdLoadPct,
      },
    },
    maxTokens: 512,
  });

  if (!result) return fallback;

  const scope = SCOPES.includes(result.scope as AdvertisingScope)
    ? (result.scope as AdvertisingScope)
    : fallback.scope;
  const advertiserTypes = Array.isArray(result.advertiserTypes)
    ? result.advertiserTypes.filter((t): t is string => typeof t === 'string' && t.length > 0).slice(0, 4)
    : [];

  return {
    scope,
    breaksPerHour: clamp(Number(result.breaksPerHour) || fallback.breaksPerHour, 1, 4),
    breakDurationSecs: clamp(Number(result.breakDurationSecs) || fallback.breakDurationSecs, 30, 180),
    targetAdLoadPct: clamp(Number(result.targetAdLoadPct) || fallback.targetAdLoadPct, 5, 25),
    advertiserTypes: advertiserTypes.length > 0 ? advertiserTypes : fallback.advertiserTypes,
    rationale: typeof result.rationale === 'string' && result.rationale
      ? result.rationale.slice(0, 300)
      : fallback.rationale,
    aiGenerated: true,
  };
}
