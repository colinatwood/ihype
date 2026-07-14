import { db } from '@/lib/db';
import { buildAutoAdBreak, type AdvertisingScope, type ShowAdClip } from '@/lib/show-composer';

// Server-only (imports @/lib/db) — never import this from a client component.
// Shared by GET /api/radio/ad-clips (the DJ's manual ad-break picker) and
// the show-save routes' auto-fill below.

const SCOPE_TO_DB: Record<AdvertisingScope, string> = {
  local: 'LOCAL',
  regional: 'REGIONAL',
  national: 'NATIONAL',
  global: 'GLOBAL',
};

/**
 * Real, purchased marketplace ad spots eligible for a given reach scope —
 * falls back to the placeholder catalog (builtInAdClips) when none exist.
 * Prisma can't compare two columns (spentCents < budgetCents) in a WHERE
 * clause without raw SQL, so — same pattern as AdBanner.tsx used — this
 * fetches a batch ordered by fewest impressions and filters
 * budget-exhausted rows in JS.
 */
export async function resolveAdBreakClips(scope: AdvertisingScope, targetSeconds = 90): Promise<ShowAdClip[]> {
  const now = new Date();
  const candidates = await db.ad.findMany({
    where: {
      status: 'APPROVED',
      scope: SCOPE_TO_DB[scope] ?? SCOPE_TO_DB.local,
      audioUrl: { not: null },
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { impressions: 'asc' },
    take: 20,
    select: { id: true, title: true, audioUrl: true, audioDurationSecs: true, budgetCents: true, spentCents: true },
  });

  const viable = candidates.filter((ad) => ad.budgetCents === 0 || ad.spentCents < ad.budgetCents);
  if (viable.length) {
    return viable.slice(0, 4).map((ad) => ({
      clipId: `mkt_${ad.id}`,
      title: ad.title,
      url: ad.audioUrl as string,
      scope,
      mimeType: 'audio/mpeg',
      durationSeconds: ad.audioDurationSecs ?? undefined,
      notes: 'Marketplace ad — purchased via the Coverage Builder.',
    }));
  }

  return buildAutoAdBreak(scope, targetSeconds);
}
