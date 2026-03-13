import { unstable_cache } from 'next/cache';
import { db, withDbRetry } from '@/lib/db';
import {
  buildActivityScopeCards,
  getScopeKeysForProfile,
  type ActivityProfileRecord,
  type ActivityRequestRecord,
  type ActivityShowRecord,
  type ScopeKey
} from '@/lib/activity-stats';

type MarketRole = 'ARTIST' | 'DJ' | 'VENUE';

type RecommendationProfile = {
  type: MarketRole;
  city: string | null;
  country: string | null;
};

type RecommendationStats = {
  pageHype: number;
  upcomingCount: number;
  previousCount: number;
  songUploads?: number;
  ticketsSold?: number;
  requestCount?: number;
  recommendationsSent?: number;
};

export type MarketOpportunityRecommendation = {
  key: ScopeKey;
  label: string;
  footprint: string;
  trendLabel: string;
  emphasis: string;
  signal: string;
  adFocus: string;
  activation: string;
};

const getMarketTrendSnapshot = unstable_cache(
  async () => {
    const [profiles, shows, requests] = await withDbRetry(() =>
      db.$transaction([
        db.profile.findMany({
          select: {
            type: true,
            name: true,
            city: true,
            stateRegion: true,
            country: true,
            postalCode: true,
            latitude: true,
            longitude: true,
            hypeCount: true
          }
        }),
        db.show.findMany({
          where: { status: { not: 'CANCELED' } },
          select: {
            title: true,
            status: true,
            startsAt: true,
            hypeCount: true,
            venueProfile: {
              select: {
                name: true,
                city: true,
                stateRegion: true,
                country: true,
                postalCode: true,
                latitude: true,
                longitude: true
              }
            },
            headlinerProfile: {
              select: {
                name: true,
                city: true,
                country: true
              }
            }
          }
        }),
        db.venueConnectionRequest.findMany({
          select: {
            venueProfile: {
              select: {
                city: true,
                country: true
              }
            },
            artistProfile: {
              select: {
                city: true,
                country: true
              }
            }
          }
        })
      ])
    );

    return buildActivityScopeCards({
      profiles: profiles as ActivityProfileRecord[],
      shows: shows as ActivityShowRecord[],
      requests: requests as ActivityRequestRecord[]
    });
  },
  ['market-trend-snapshot-v1'],
  { revalidate: 60 }
);

function formatRoleLabel(type: MarketRole) {
  if (type === 'DJ') {
    return 'promoter';
  }

  return type.toLowerCase();
}

function getTrendLabel(score: number) {
  if (score >= 72) return 'High momentum';
  if (score >= 34) return 'Warm momentum';
  return 'Emerging momentum';
}

function getReadinessScore(type: MarketRole, stats: RecommendationStats) {
  if (type === 'ARTIST') {
    return stats.pageHype + stats.upcomingCount * 6 + stats.previousCount * 3 + (stats.songUploads ?? 0) * 4;
  }

  if (type === 'DJ') {
    return (
      stats.pageHype +
      stats.upcomingCount * 7 +
      stats.previousCount * 4 +
      (stats.recommendationsSent ?? 0) * 5
    );
  }

  return (
    stats.pageHype +
    stats.upcomingCount * 7 +
    stats.previousCount * 4 +
    Math.round((stats.ticketsSold ?? 0) / 25) +
    (stats.requestCount ?? 0) * 3
  );
}

function getAdFocus(type: MarketRole, scope: ScopeKey, stats: RecommendationStats) {
  if (type === 'ARTIST') {
    if (scope === 'local') {
      return stats.upcomingCount
        ? 'Boost nearby date announcements and track snippets to listeners already moving in your city.'
        : 'Run discovery ads around your strongest uploaded track and profile story to build city-level recognition.';
    }

    if (scope === 'regional') {
      return 'Expand beyond the hometown audience with teaser clips aimed at nearby rooms, local press, and traveling fans.';
    }

    if (scope === 'national') {
      return 'Package your profile hype, best upload, and live photo/banner creative into a broader artist-awareness campaign.';
    }

    return 'Test lightweight international awareness around stream replays, merch drops, or standout visual identity assets.';
  }

  if (type === 'DJ') {
    if (scope === 'local') {
      return 'Push your next room concept to nearby listeners and venue teams who already respond to curated nights.';
    }

    if (scope === 'regional') {
      return 'Promote guest-night concepts and booking availability across neighboring cities with similar nightlife density.';
    }

    if (scope === 'national') {
      return 'Run promoter-brand ads that package your strongest past show outcomes and the artists you consistently champion.';
    }

    return 'Use recorded show moments and branded mix clips for wider awareness without overspending on cold traffic.';
  }

  if (scope === 'local') {
    return 'Promote your calendar, room identity, parking, and neighborhood convenience to people most likely to convert quickly.';
  }

  if (scope === 'regional') {
    return 'Position the venue as a destination room for nearby-city travelers, weekend plans, and partner collectives.';
  }

  if (scope === 'national') {
    return 'Feature headline weekends, ticketed events, and stay-nearby details to attract out-of-market fans planning travel.';
  }

  return 'Use livestream teasers, venue visuals, and city storytelling for awareness campaigns tied to marquee nights.';
}

function getActivation(type: MarketRole, scope: ScopeKey, stats: RecommendationStats, isHomeMarket: boolean) {
  const campaignMode = isHomeMarket ? 'home market' : scope === 'global' ? 'awareness' : 'expansion';

  if (type === 'ARTIST') {
    if ((stats.songUploads ?? 0) === 0) {
      return `Build one playable upload first, then turn this ${campaignMode} signal into ad creative.`;
    }

    if (stats.upcomingCount > 0) {
      return `Lead with upcoming dates plus uploaded audio in this ${campaignMode} campaign.`;
    }

    return `Lead with profile hype and uploaded tracks to test demand in this ${campaignMode} campaign.`;
  }

  if (type === 'DJ') {
    if (stats.upcomingCount > 0) {
      return `Use your next scheduled room as the conversion hook for this ${campaignMode} campaign.`;
    }

    return `Use your page story, partner artists, and show-history highlights as the hook for this ${campaignMode} campaign.`;
  }

  if (stats.upcomingCount > 0) {
    return `Promote the next ${stats.upcomingCount} scheduled night${stats.upcomingCount === 1 ? '' : 's'} with venue logistics front and center.`;
  }

  return `Wait for the next calendar drop, then pair event creative with venue logistics for this ${campaignMode} push.`;
}

export async function getAdvertisingRecommendations({
  profile,
  stats
}: {
  profile: RecommendationProfile;
  stats: RecommendationStats;
}): Promise<MarketOpportunityRecommendation[]> {
  const scopeCards = await getMarketTrendSnapshot();
  const scopeKeys = getScopeKeysForProfile({
    city: profile.city,
    country: profile.country
  });
  const readinessScore = getReadinessScore(profile.type, stats);

  return scopeCards.map((scope) => {
    const marketSignalScore =
      scope.profiles * 2 + scope.activeShows * 5 + scope.requests * 4 + Math.round(scope.totalHype / 3);
    const isHomeMarket = scope.key !== 'global' && scopeKeys.includes(scope.key);
    const adjustedScore = marketSignalScore + readinessScore + (isHomeMarket ? 12 : 0);

    return {
      key: scope.key,
      label: scope.label,
      footprint: scope.footprint,
      trendLabel: getTrendLabel(adjustedScore),
      emphasis: scope.key === 'global' ? 'Awareness test' : isHomeMarket ? 'Best current fit' : 'Expansion lane',
      signal: `${scope.activeShows} active shows · ${scope.totalHype} hype · ${scope.requests} booking signals`,
      adFocus: getAdFocus(profile.type, scope.key, stats),
      activation: getActivation(profile.type, scope.key, stats, isHomeMarket)
    };
  });
}
