const usaCountries = new Set(['usa', 'united states', 'united states of america']);
const midwestCities = new Set([
  'chicago',
  'milwaukee',
  'detroit',
  'minneapolis',
  'st. louis',
  'indianapolis',
  'madison',
  'cleveland',
  'columbus',
  'kansas city'
]);

export type ActivityProfileRecord = {
  type: 'ARTIST' | 'DJ' | 'VENUE' | 'LISTENER';
  name: string;
  city: string | null;
  stateRegion: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  hypeCount: number;
};

export type ActivityShowProfileRecord = {
  name: string;
  city: string | null;
  stateRegion: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type ActivityShowRecord = {
  title: string;
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELED';
  startsAt: Date;
  hypeCount: number;
  venueProfile: ActivityShowProfileRecord | null;
  headlinerProfile: Pick<ActivityShowProfileRecord, 'name' | 'city' | 'country'> | null;
};

export type ActivityRequestRecord = {
  venueProfile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null;
  artistProfile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null;
};

export type ScopeKey = 'local' | 'regional' | 'national' | 'global';

export type ActivityScopeCard = {
  key: ScopeKey;
  label: string;
  footprint: string;
  description: string;
  profiles: number;
  activeShows: number;
  totalHype: number;
  requests: number;
};

export type ActivityMapPoint = {
  id: string;
  label: string;
  city: string;
  stateRegion: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  scopes: ScopeKey[];
  venueCount: number;
  showCount: number;
  liveCount: number;
  upcomingCount: number;
  profileCount: number;
  totalHype: number;
  venueNames: string[];
  showTitles: string[];
};

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function isUsa(country?: string | null) {
  return usaCountries.has(normalize(country));
}

function isLocalCity(city?: string | null) {
  return normalize(city) === 'chicago';
}

function isRegionalCity(city?: string | null) {
  return midwestCities.has(normalize(city));
}

function showMatches(show: ActivityShowRecord, matcher: (profile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null) => boolean) {
  return matcher(show.venueProfile) || matcher(show.headlinerProfile);
}

function requestMatches(
  request: ActivityRequestRecord,
  matcher: (profile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null) => boolean
) {
  return matcher(request.venueProfile) || matcher(request.artistProfile);
}

export function getScopeKeysForProfile(profile: Pick<ActivityShowProfileRecord, 'city' | 'country'>): ScopeKey[] {
  const scopeKeys: ScopeKey[] = ['global'];

  if (isUsa(profile.country)) {
    scopeKeys.unshift('national');
  }

  if (isRegionalCity(profile.city)) {
    scopeKeys.unshift('regional');
  }

  if (isLocalCity(profile.city)) {
    scopeKeys.unshift('local');
  }

  return Array.from(new Set(scopeKeys));
}

export const activityScopes = [
  {
    key: 'local' as const,
    label: 'Local',
    footprint: 'Chicago',
    description: 'Activity tied directly to Chicago city metadata on profiles and hosted shows.',
    matchesProfile: (profile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null) =>
      Boolean(profile && isLocalCity(profile.city))
  },
  {
    key: 'regional' as const,
    label: 'Regional',
    footprint: 'Midwest',
    description: 'Midwest activity across Chicago and nearby city clusters used for the pilot footprint.',
    matchesProfile: (profile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null) =>
      Boolean(profile && isRegionalCity(profile.city))
  },
  {
    key: 'national' as const,
    label: 'National',
    footprint: 'United States',
    description: 'US activity based on country metadata, regardless of city.',
    matchesProfile: (profile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null) =>
      Boolean(profile && isUsa(profile.country))
  },
  {
    key: 'global' as const,
    label: 'Global',
    footprint: 'Worldwide',
    description: 'All current platform activity across every profile and show in the network.',
    matchesProfile: (profile: Pick<ActivityShowProfileRecord, 'city' | 'country'> | null) => Boolean(profile)
  }
];

export function buildActivityScopeCards({
  profiles,
  shows,
  requests
}: {
  profiles: ActivityProfileRecord[];
  shows: ActivityShowRecord[];
  requests: ActivityRequestRecord[];
}): ActivityScopeCard[] {
  const now = new Date();

  return activityScopes.map((scope) => {
    const scopedProfiles = profiles.filter((profile) => scope.matchesProfile(profile));
    const scopedShows = shows.filter((show) => showMatches(show, scope.matchesProfile));
    const activeShows = scopedShows.filter((show) => show.status === 'LIVE' || show.startsAt >= now);
    const scopedRequests = requests.filter((request) => requestMatches(request, scope.matchesProfile));
    const totalHype =
      scopedProfiles.reduce((sum, profile) => sum + profile.hypeCount, 0) +
      scopedShows.reduce((sum, show) => sum + show.hypeCount, 0);

    return {
      key: scope.key,
      label: scope.label,
      footprint: scope.footprint,
      description: scope.description,
      profiles: scopedProfiles.length,
      activeShows: activeShows.length,
      totalHype,
      requests: scopedRequests.length
    };
  });
}

export function buildActivityMapPoints({
  profiles,
  shows
}: {
  profiles: ActivityProfileRecord[];
  shows: ActivityShowRecord[];
}): ActivityMapPoint[] {
  const now = new Date();
  const groupedPoints = new Map<string, ActivityMapPoint>();

  const locateProfilePoint = (profile: ActivityProfileRecord | ActivityShowProfileRecord) => {
    if (
      !profile.city ||
      !profile.country ||
      !profile.postalCode ||
      profile.latitude == null ||
      profile.longitude == null
    ) {
      return null;
    }

    const key = `${profile.postalCode}-${profile.latitude.toFixed(4)}-${profile.longitude.toFixed(4)}`;
    const existing = groupedPoints.get(key);

    if (existing) {
      return existing;
    }

    const point: ActivityMapPoint = {
      id: key,
      label: `${profile.postalCode} - ${profile.city}`,
      city: profile.city,
      stateRegion: profile.stateRegion ?? '',
      country: profile.country,
      postalCode: profile.postalCode,
      latitude: profile.latitude,
      longitude: profile.longitude,
      scopes: getScopeKeysForProfile(profile),
      venueCount: 0,
      showCount: 0,
      liveCount: 0,
      upcomingCount: 0,
      profileCount: 0,
      totalHype: 0,
      venueNames: [],
      showTitles: []
    };

    groupedPoints.set(key, point);
    return point;
  };

  for (const profile of profiles) {
    const point = locateProfilePoint(profile);
    if (!point) {
      continue;
    }

    point.profileCount += 1;
    point.totalHype += profile.hypeCount;

    if (profile.type === 'VENUE' && !point.venueNames.includes(profile.name)) {
      point.venueCount += 1;
      point.venueNames.push(profile.name);
    }
  }

  for (const show of shows) {
    if (!show.venueProfile) {
      continue;
    }

    const point = locateProfilePoint(show.venueProfile);
    if (!point) {
      continue;
    }

    point.showCount += 1;
    point.totalHype += show.hypeCount;

    if (!point.showTitles.includes(show.title)) {
      point.showTitles.push(show.title);
    }

    if (show.status === 'LIVE') {
      point.liveCount += 1;
    }

    if (show.status === 'LIVE' || show.startsAt >= now) {
      point.upcomingCount += 1;
    }
  }

  return Array.from(groupedPoints.values()).sort((left, right) => {
    const leftScore = left.liveCount * 5 + left.upcomingCount * 3 + left.venueCount * 2 + left.totalHype;
    const rightScore = right.liveCount * 5 + right.upcomingCount * 3 + right.venueCount * 2 + right.totalHype;

    return rightScore - leftScore;
  });
}
