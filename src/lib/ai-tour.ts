import { runAIJson } from '@/lib/ai';

export type TourStopInput = {
  city: string;
  score: number;
  reach: string;
  showCount: number;
  venues: { id: string; name: string; slug: string; hypeCount: number; upcomingShows: number }[];
};

export type AiTourPlan = {
  summary: string;
  route: Array<{
    city: string;
    order: number;
    why: string;
    targetVenue: string | null;
  }>;
};

type RawPlan = {
  summary?: string;
  route?: Array<{ city?: string; order?: number; why?: string; targetVenue?: string | null }>;
};

/**
 * AI routing layer over the demand-ranked tour stops: turns the raw city
 * demand list into an ordered itinerary tailored to the artist's genre and
 * home base, with a venue target and rationale per stop. Returns null when
 * the AI binding is unavailable — the deterministic stops list still renders.
 */
export async function buildAiTourPlan(
  artist: { name: string; genres: string[]; city: string | null; stateRegion: string | null; hypeCount: number },
  stops: TourStopInput[],
): Promise<AiTourPlan | null> {
  if (stops.length === 0) return null;

  const result = await runAIJson<RawPlan>({
    system: `You are the tour-routing engine for iHYPE.org, a grassroots music platform.
Given an artist and demand-ranked candidate cities (score/reach/upcoming-show counts come from real fan-hype data), build a practical tour itinerary.

Rules:
- Order cities into a sensible route: start near the artist's home base when it appears, favour high-demand stops, and keep the sequence geographically coherent where city names make that possible.
- Include at most 8 stops; drop weak fits rather than padding.
- "why" is one short sentence per stop grounded ONLY in the provided data (demand score, reach, show activity, proximity, genre fit). Never invent venues or numbers.
- "targetVenue" must be one of that city's listed venue names, or null.

JSON shape: {"summary": "2-sentence overview of the routing strategy", "route": [{"city": string, "order": number, "why": string, "targetVenue": string|null}]}`,
    input: {
      artist: {
        name: artist.name,
        genres: artist.genres.slice(0, 6),
        homeCity: artist.city,
        homeRegion: artist.stateRegion,
        hypeCount: artist.hypeCount,
      },
      candidateCities: stops.map((s) => ({
        city: s.city,
        demandScore: s.score,
        reach: s.reach,
        upcomingShows: s.showCount,
        venues: s.venues.map((v) => ({ name: v.name, hypeCount: v.hypeCount, upcomingShows: v.upcomingShows })),
      })),
    },
    maxTokens: 1024,
  });

  if (!result || !Array.isArray(result.route) || result.route.length === 0) return null;

  const validCities = new Set(stops.map((s) => s.city));
  const venueNamesByCity = new Map(stops.map((s) => [s.city, new Set(s.venues.map((v) => v.name))]));

  const route = result.route
    .filter((r): r is { city: string; order?: number; why?: string; targetVenue?: string | null } =>
      typeof r?.city === 'string' && validCities.has(r.city))
    .slice(0, 8)
    .map((r, i) => ({
      city: r.city,
      order: typeof r.order === 'number' ? r.order : i + 1,
      why: typeof r.why === 'string' ? r.why.slice(0, 160) : '',
      targetVenue:
        typeof r.targetVenue === 'string' && venueNamesByCity.get(r.city)?.has(r.targetVenue)
          ? r.targetVenue
          : null,
    }))
    .sort((a, b) => a.order - b.order);

  if (route.length === 0) return null;

  return {
    summary: typeof result.summary === 'string' ? result.summary.slice(0, 400) : '',
    route,
  };
}
