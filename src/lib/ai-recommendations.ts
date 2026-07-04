import { runAIJson } from '@/lib/ai';
import type { RecommendedProfile } from '@/lib/recommendations';

const MAX_AI_CANDIDATES = 20;

type AiPickResponse = {
  picks?: Array<{ index?: number; why?: string }>;
};

export type AiEnhancedRecommendations = {
  profiles: RecommendedProfile[];
  aiEnhanced: boolean;
};

/**
 * AI layer over the deterministic multi-signal recommender. Takes the already
 * scored/ranked profiles plus a compact viewer taste summary, and asks the
 * model to re-rank the head of the list and write a personalised one-line
 * "why" for each pick. Falls back to the deterministic order untouched when
 * the AI binding is unavailable or returns garbage — the fan feed must never
 * depend on the model being up.
 */
export async function enhanceRecommendationsWithAI(
  profiles: RecommendedProfile[],
  viewer: {
    genres: string[];
    city: string | null;
    stateRegion: string | null;
    hasHypeHistory: boolean;
  },
): Promise<AiEnhancedRecommendations> {
  // Without taste history the deterministic geo/momentum ranking is already
  // the best we can do — skip the AI call entirely.
  if (!viewer.hasHypeHistory || profiles.length < 3) {
    return { profiles, aiEnhanced: false };
  }

  const head = profiles.slice(0, MAX_AI_CANDIDATES);
  const tail = profiles.slice(MAX_AI_CANDIDATES);

  const result = await runAIJson<AiPickResponse>({
    system: `You are the recommendation engine for iHYPE.org, a music discovery platform.
Given a fan's taste summary and a candidate list of artists/DJs/venues (already pre-scored by taste, locality, collaborative filtering, and hype momentum), re-rank the candidates for this fan and explain each pick.

Rules:
- Return every candidate index exactly once, best match first.
- "why" is one short sentence (max 90 chars), specific to the fan's genres or scene. Never invent facts not present in the data.

JSON shape: {"picks": [{"index": number, "why": string}, ...]}`,
    input: {
      fan: {
        topGenres: viewer.genres.slice(0, 8),
        city: viewer.city,
        region: viewer.stateRegion,
      },
      candidates: head.map((p, index) => ({
        index,
        name: p.name,
        type: p.type,
        genres: p.genres.slice(0, 5),
        city: p.city,
        hypeCount: p.hypeCount,
        dominantSignal: p.reason.kind,
      })),
    },
    maxTokens: 1024,
  });

  const picks = result?.picks;
  if (!Array.isArray(picks) || picks.length === 0) {
    return { profiles, aiEnhanced: false };
  }

  const seen = new Set<number>();
  const reordered: RecommendedProfile[] = [];
  for (const pick of picks) {
    const index = typeof pick?.index === 'number' ? pick.index : -1;
    if (index < 0 || index >= head.length || seen.has(index)) continue;
    seen.add(index);
    const profile = head[index];
    const why = typeof pick.why === 'string' ? pick.why.trim().slice(0, 120) : '';
    reordered.push(
      why
        ? { ...profile, reason: { ...profile.reason, text: why } }
        : profile,
    );
  }
  // Any candidates the model dropped keep their deterministic slot after the
  // AI-ranked ones, so nothing silently disappears from the feed.
  for (let i = 0; i < head.length; i++) {
    if (!seen.has(i)) reordered.push(head[i]);
  }

  const merged = [...reordered, ...tail];
  merged.forEach((p, i) => { p._rank = i; });
  return { profiles: merged, aiEnhanced: true };
}
