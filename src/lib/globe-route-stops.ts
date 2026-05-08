type GlobeVenueProfile = {
  name: string | null;
  slug: string | null;
  city: string | null;
  stateRegion: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
};

type GlobeRouteShow = {
  id: string;
  title: string;
  slug: string;
  startsAt: Date;
  status: string;
  venueProfile: GlobeVenueProfile | null;
};

export function formatShowDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);
}

export function buildGlobeRouteStops(
  shows: GlobeRouteShow[],
  options: { includePastTiming?: boolean; now?: Date } = {}
) {
  const now = options.now ?? new Date();

  return shows
    .filter((show) => show.venueProfile?.latitude != null && show.venueProfile.longitude != null)
    .map((show) => ({
      id: show.id,
      title: show.title,
      href: `/shows/${show.slug}`,
      venueName: show.venueProfile?.name ?? 'Venue',
      venueSlug: show.venueProfile?.slug ?? null,
      city: show.venueProfile?.city ?? null,
      stateRegion: show.venueProfile?.stateRegion ?? null,
      country: show.venueProfile?.country ?? null,
      postalCode: show.venueProfile?.postalCode ?? null,
      latitude: show.venueProfile?.latitude ?? null,
      longitude: show.venueProfile?.longitude ?? null,
      startsAtLabel: formatShowDate(show.startsAt),
      timing:
        show.status === 'LIVE'
          ? ('live' as const)
          : options.includePastTiming && show.startsAt < now
            ? ('past' as const)
            : ('upcoming' as const),
    }));
}
