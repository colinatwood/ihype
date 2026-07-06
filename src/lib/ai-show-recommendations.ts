import { runAIJson } from '@/lib/ai';
import type { RecommendedShow } from '@/lib/show-recommendations';

const MAX_AI_CANDIDATES = 20;

type AiPickResponse = {
  picks?: Array<{ index?: number; why?: string }>;
};

export type AiEnhancedShowRecommendations = {
  shows: RecommendedShow[];
  aiEnhanced: boolean;
};

/**
 * AI layer over the deterministic show recommender (show-recommendations.ts).
 * Takes the already-scored/ranked shows plus a compact viewer taste+history
 * summary, and asks the model to re-rank the head of the list and write a
 * personalized one-line "why" for each pick — mirrors the artist/venue
 * version in ai-recommendations.ts. Falls back to the deterministic order
 * untouched when the AI binding is unavailable or returns garbage; For You
 * must never depend on the model being up.
 */
export async function enhanceShowRecommendationsWithAI(
  shows: RecommendedShow[],
  viewer: {
    genres: string[];
    city: string | null;
    stateRegion: string | null;
    hasHistory: boolean;
    recentArtists: string[];
  },
): Promise<AiEnhancedShowRecommendations> {
  // Without any taste/history signal the deterministic geo/momentum ranking
  // is already the best we can do — skip the AI call entirely.
  if (!viewer.hasHistory || shows.length < 3) {
    return { shows, aiEnhanced: false };
  }

  const head = shows.slice(0, MAX_AI_CANDIDATES);
  const tail = shows.slice(MAX_AI_CANDIDATES);

  const result = await runAIJson<AiPickResponse>({
    system: `You are the "For You" show recommendation engine for iHYPE.org, a music discovery and ticketing platform.
Given a fan's taste summary (genres they hype, recent artists they've engaged with, home city) and a candidate list of upcoming shows (already pre-scored by taste, locality, ticket momentum, collaborative filtering, and repeat-attendance history), re-rank the candidates for this fan and explain each pick.

Rules:
- Return every candidate index exactly once, best match first.
- "why" is one short sentence (max 90 chars), specific to the fan's genres, a named artist connection, or their city. Never invent facts not present in the data.

JSON shape: {"picks": [{"index": number, "why": string}, ...]}`,
    input: {
      fan: {
        topGenres: viewer.genres.slice(0, 8),
        city: viewer.city,
        region: viewer.stateRegion,
        recentArtists: viewer.recentArtists.slice(0, 8),
      },
      candidates: head.map((s, index) => ({
        index,
        title: s.title,
        headliner: s.headlinerProfile?.name ?? null,
        genres: s.headlinerProfile?.genres.slice(0, 5) ?? [],
        venue: s.venueProfile?.name ?? null,
        city: s.venueProfile?.city ?? null,
        startsAt: s.startsAt,
        ticketPriceCents: s.ticketPriceCents,
        dominantSignal: s.reason.kind,
      })),
    },
    maxTokens: 1024,
  });

  const picks = result?.picks;
  if (!Array.isArray(picks) || picks.length === 0) {
    return { shows, aiEnhanced: false };
  }

  const seen = new Set<number>();
  const reordered: RecommendedShow[] = [];
  for (const pick of picks) {
    const index = typeof pick?.index === 'number' ? pick.index : -1;
    if (index < 0 || index >= head.length || seen.has(index)) continue;
    seen.add(index);
    const show = head[index];
    const why = typeof pick.why === 'string' ? pick.why.trim().slice(0, 120) : '';
    reordered.push(why ? { ...show, reason: { ...show.reason, text: why } } : show);
  }
  // Any candidates the model dropped keep their deterministic slot after the
  // AI-ranked ones, so nothing silently disappears from the feed.
  for (let i = 0; i < head.length; i++) {
    if (!seen.has(i)) reordered.push(head[i]);
  }

  return { shows: [...reordered, ...tail], aiEnhanced: true };
}
