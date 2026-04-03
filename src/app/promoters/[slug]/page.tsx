import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { buildArtistMediaCollection } from '@/lib/media';
import { ShowCard } from '@/components/ShowCard';
import { HypeButton } from '@/components/HypeButton';
import { PromoterOwnerWorkspace } from '@/components/PromoterOwnerWorkspace';
import { MarketRecommendationsPanel } from '@/components/MarketRecommendationsPanel';
import { PromoterPageBuilder } from '@/components/PromoterPageBuilder';
import { NetworkEarthGlobe } from '@/components/NetworkEarthGlobe';
import { DEFAULT_PROFILE_DESIGN_PRESET, getProfileDesignStyleVars } from '@/lib/profile-design';
import { getSafeBackgroundImageStyle, getSafeImageUrl, getSafeVideoUrl } from '@/lib/asset-safety';
import { canManageOwnedResource } from '@/lib/permissions';
import { getAdvertisingRecommendations } from '@/lib/market-recommendations';
import { detectRequestLocation } from '@/lib/request-location';

const promoterSections = ['about', 'shows', 'events'] as const;
const promoterEditModules = ['builder', 'workspace', 'recommendations'] as const;

type PromoterSection = (typeof promoterSections)[number];
type PromoterEditModule = (typeof promoterEditModules)[number];

function getActiveSection(section: string | string[] | undefined): PromoterSection {
  if (section === 'upcoming' || section === 'previous') {
    return 'shows';
  }

  if (section === 'recommend' || section === 'stats') {
    return 'events';
  }

  if (typeof section === 'string' && promoterSections.includes(section as PromoterSection)) {
    return section as PromoterSection;
  }

  return 'about';
}

function getSectionLabel(section: PromoterSection) {
  if (section === 'shows') return 'Shows';
  if (section === 'events') return 'Events';
  return section.charAt(0).toUpperCase() + section.slice(1);
}

function getActiveEditModule(module: string | string[] | undefined): PromoterEditModule | null {
  if (typeof module === 'string' && promoterEditModules.includes(module as PromoterEditModule)) {
    return module as PromoterEditModule;
  }

  return null;
}

function formatRequestStatus(value: 'PENDING' | 'BOOKED' | 'DISMISSED') {
  if (value === 'BOOKED') return 'Booked';
  if (value === 'DISMISSED') return 'Dismissed';
  return 'Pending';
}

function formatShowDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(value);
}

export default async function PromoterPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ section?: string | string[]; edit?: string | string[] }>;
}) {
  const session = await auth();
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeSection = getActiveSection(resolvedSearchParams.section);
  const activeEditModule = getActiveEditModule(resolvedSearchParams.edit);

  const profile = await db.profile.findUnique({ where: { slug } });
  if (!profile || profile.type !== 'DJ') return notFound();
  const profileSlug = profile.slug;
  const isOwner = canManageOwnedResource(session, profile.ownerId);

  const [shows, sentRecommendations, artistProfiles, viewerLocation, venues, fanHypeCount] = await Promise.all([
    db.show.findMany({
      where: { promoterProfileId: profile.id },
      include: { venueProfile: true, headlinerProfile: true, promoterProfile: true },
      orderBy: { startsAt: 'asc' }
    }),
    db.venueConnectionRequest.findMany({
      where: { requesterId: profile.ownerId, requesterType: 'PROMOTER' },
      include: { venueProfile: true, artistProfile: true },
      orderBy: { createdAt: 'desc' }
    }),
    isOwner
      ? db.profile.findMany({
          where: {
            type: 'ARTIST',
            OR: [{ mediaContent: { not: null } }, { mediaUploads: { some: {} } }]
          },
          select: {
            id: true,
            slug: true,
            name: true,
            heroImage: true,
            mediaContent: true,
            mediaUploads: {
              select: {
                hexId: true,
                title: true,
                notes: true,
                mimeType: true,
                fileSizeBytes: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { name: 'asc' }
        })
      : Promise.resolve([])
    ,
    detectRequestLocation(),
    db.profile.findMany({
      where: {
        type: 'VENUE',
        latitude: { not: null },
        longitude: { not: null }
      },
      orderBy: [{ verified: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        addressLine1: true,
        hoursText: true,
        city: true,
        stateRegion: true,
        country: true,
        postalCode: true,
        latitude: true,
        longitude: true
      }
    }),
    db.profileHypeEvent.count({
      where: {
        profileId: profile.id,
        user: {
          role: 'FAN'
        }
      }
    })
  ]);

  const now = new Date();
  const upcomingShows = shows.filter((show) => show.status === 'LIVE' || show.startsAt >= now);
  const previousShows = shows.filter((show) => show.status === 'ENDED' || (show.startsAt < now && show.status !== 'LIVE'));
  const recentShows = [...shows].sort((left, right) => right.startsAt.getTime() - left.startsAt.getTime()).slice(0, 6);
  const recentRecommendations = sentRecommendations.slice(0, 6);
  const artistLibraries = artistProfiles
    .map((artistProfile) => ({
      profileId: artistProfile.id,
      slug: artistProfile.slug,
      name: artistProfile.name,
      heroImage: artistProfile.heroImage,
      entries: buildArtistMediaCollection(artistProfile.mediaContent, artistProfile.mediaUploads).entries
    }))
    .filter((artistProfile) => artistProfile.entries.length > 0);
  const canViewCustomPage = isOwner || profile.fanShareEnabled;
  const sharedThemePreset = canViewCustomPage ? profile.themePreset : DEFAULT_PROFILE_DESIGN_PRESET;
  const bannerStyle = canViewCustomPage ? getSafeBackgroundImageStyle(profile.heroImage) : undefined;
  const pageDesignStyle = getProfileDesignStyleVars(sharedThemePreset, {
    accentTone: canViewCustomPage ? profile.themeAccentTone : undefined,
    backdropTone: canViewCustomPage ? profile.themeBackdropTone : undefined,
    fontPreset: canViewCustomPage ? profile.themeFontPreset : undefined
  });
  const logoUrl = canViewCustomPage ? getSafeImageUrl(profile.logoImage || profile.avatarImage) : null;
  const featureImageUrl = canViewCustomPage ? getSafeImageUrl(profile.galleryImage || profile.heroImage) : null;
  const featureVideoUrl = canViewCustomPage ? getSafeVideoUrl(profile.featureVideoUrl) : null;
  const recommendations = await getAdvertisingRecommendations({
    profile: {
      type: 'DJ',
      city: profile.city,
      country: profile.country
    },
    stats: {
      pageHype: fanHypeCount,
      upcomingCount: upcomingShows.length,
      previousCount: previousShows.length,
      recommendationsSent: sentRecommendations.length
    }
  });
  const lifetimeStats = {
    totalShows: shows.length,
    totalHype: shows.reduce((sum, show) => sum + show.hypeCount, 0),
    totalTicketsSold: shows.reduce((sum, show) => sum + show.ticketsSoldCount, 0),
    totalFans: new Set(sentRecommendations.map((request) => request.requesterId)).size + fanHypeCount
  };
  const globeRouteStops = previousShows
    .filter(
      (show) =>
        show.venueProfile?.latitude != null &&
        show.venueProfile.longitude != null
    )
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime())
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
      timing: 'past' as const
    }));

  function getPageHref(section: PromoterSection, editModule: PromoterEditModule | null) {
    const params = new URLSearchParams();
    params.set('section', section);
    if (editModule) {
      params.set('edit', editModule);
    }
    return `/promoters/${profileSlug}?${params.toString()}`;
  }

  return (
    <main className="container section profile-design-shell" style={pageDesignStyle}>
      <header className="artist-banner panel" style={bannerStyle}>
        <div className="artist-banner-copy">
          {logoUrl ? <img alt={`${profile.name} logo`} className="artist-logo-mark" src={logoUrl} /> : null}
          <div className="badge">PROMOTER</div>
          <h1 className="title" style={{ fontSize: '2.9rem' }}>{profile.name}</h1>
          <p className="artist-headline">{profile.headline || 'Set the tone for the nights, talent, and scenes you champion.'}</p>
          <p className="subtitle">{profile.bio}</p>
          <p className="meta">{[profile.city, profile.country].filter(Boolean).join(', ')}</p>
          {profile.contactInfo ? <p className="meta">{profile.contactInfo}</p> : null}
          <p className="meta">Share ID: <Link href={`/profiles/${profile.hexId}`}>{profile.hexId}</Link></p>
          <p className="meta">Fan hype: {fanHypeCount}</p>
          <div className="tag-row">{profile.genres.map((genre) => <span key={genre} className="tag">{genre}</span>)}</div>
          <HypeButton targetType="profile" targetId={profile.id} initialCount={profile.hypeCount} entityLabel="promoter" />
        </div>
      </header>

      {isOwner ? (
        <section className="section owner-edit-shell">
          <div className="panel owner-edit-panel">
            <div className="owner-edit-header">
              <div>
                <span className="badge">Edit Profile</span>
                <h2>Promoter tools</h2>
                <p className="meta">Open one module at a time and keep the rest tucked away.</p>
              </div>
              {activeEditModule ? (
                <Link className="button small secondary" href={getPageHref(activeSection, null)}>
                  Hide tools
                </Link>
              ) : null}
            </div>

            <nav className="owner-edit-tabs" aria-label="Promoter edit modules">
              <Link
                className={activeEditModule === 'builder' ? 'owner-edit-tab active' : 'owner-edit-tab'}
                href={getPageHref(activeSection, activeEditModule === 'builder' ? null : 'builder')}
              >
                Page Builder
              </Link>
              <Link
                className={activeEditModule === 'workspace' ? 'owner-edit-tab active' : 'owner-edit-tab'}
                href={getPageHref(activeSection, activeEditModule === 'workspace' ? null : 'workspace')}
              >
                Show Creator
              </Link>
              <Link
                className={activeEditModule === 'recommendations' ? 'owner-edit-tab active' : 'owner-edit-tab'}
                href={getPageHref(activeSection, activeEditModule === 'recommendations' ? null : 'recommendations')}
              >
                Recommendations
              </Link>
            </nav>

            {activeEditModule === 'builder' ? (
              <PromoterPageBuilder
                hideToggle
                initialValues={{
                  headline: profile.headline ?? '',
                  bio: profile.bio ?? '',
                  heroImage: profile.heroImage ?? '',
                  logoImage: profile.logoImage ?? profile.avatarImage ?? '',
                  galleryImage: profile.galleryImage ?? '',
                  featureVideoUrl: profile.featureVideoUrl ?? '',
                  aboutContent: profile.aboutContent ?? '',
                  recommendContent: profile.recommendContent ?? '',
                  contactInfo: profile.contactInfo ?? '',
                  city: profile.city ?? '',
                  stateRegion: profile.stateRegion ?? '',
                  country: profile.country ?? '',
                  themePreset: profile.themePreset,
                  themeFontPreset: profile.themeFontPreset,
                  themeAccentTone: profile.themeAccentTone ?? '',
                  themeBackdropTone: profile.themeBackdropTone ?? '',
                  fanShareEnabled: profile.fanShareEnabled
                }}
                previewGenres={profile.genres}
                profileId={profile.id}
                profileName={profile.name}
                startOpen
              />
            ) : null}

            {activeEditModule === 'workspace' ? (
              <PromoterOwnerWorkspace
                artists={artistLibraries}
                lifetimeStats={lifetimeStats}
                promoter={{ profileId: profile.id, name: profile.name, slug: profile.slug }}
                recentShows={recentShows.map((show) => ({
                  id: show.id,
                  title: show.title,
                  status: show.status,
                  startsAtLabel: formatShowDate(show.startsAt),
                  venueName: show.venueProfile?.name ?? null,
                  venuePostalCode: show.venueProfile?.postalCode ?? null,
                  ticketsSoldCount: show.ticketsSoldCount,
                  hypeCount: show.hypeCount,
                  showPath: `/shows/${show.slug}`
                }))}
                recommendations={recentRecommendations.map((request) => ({
                  id: request.id,
                  venueName: request.venueProfile.name,
                  artistName: request.artistProfile?.name ?? request.artistName,
                  status: formatRequestStatus(request.status)
                }))}
              />
            ) : null}

            {activeEditModule === 'recommendations' ? (
              <MarketRecommendationsPanel recommendations={recommendations} roleLabel="promoter" />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="section">
        <nav className="section-tabs" aria-label="Promoter page sections">
          {promoterSections.map((section) => (
            <Link
              key={section}
              className={section === activeSection ? 'section-tab active' : 'section-tab'}
              href={`/promoters/${profileSlug}?section=${section}`}
            >
              {getSectionLabel(section)}
            </Link>
          ))}
        </nav>

        <div className="panel artist-section-panel">
          {activeSection === 'about' ? (
            <>
              <h2>About</h2>
              <div className="artist-copy">{profile.aboutContent || profile.bio || 'This promoter has not filled out the About section yet.'}</div>
            </>
          ) : null}

          {activeSection === 'shows' ? (
            <>
              <h2>Shows</h2>
              <div className="artist-tour-shows">
                <h3>Upcoming</h3>
                <div className="grid grid-2">
                  {upcomingShows.length ? upcomingShows.map((show) => <ShowCard key={show.id} show={show} />) : <div className="empty">No upcoming shows yet.</div>}
                </div>
              </div>

              <div className="artist-tour-shows">
                <h3>Previous</h3>
                <div className="grid grid-2">
                  {previousShows.length ? previousShows.map((show) => <ShowCard key={show.id} show={show} />) : <div className="empty">No previous shows yet.</div>}
                </div>
              </div>
            </>
          ) : null}

          {activeSection === 'events' ? (
            <>
              <h2>Events</h2>
              <div className="artist-copy">{profile.recommendContent || 'Use this section to explain the rooms, artists, and collaborations you like to champion.'}</div>
              {featureImageUrl ? (
                <div className="artist-media-visuals">
                  <img alt={`${profile.name} featured visual`} className="artist-media-visual-image" src={featureImageUrl} />
                </div>
              ) : null}
              {featureVideoUrl ? (
                <div className="artist-media-visuals">
                  <video className="artist-media-visual-video" controls preload="metadata" src={featureVideoUrl} />
                </div>
              ) : null}

              <NetworkEarthGlobe
                description="Start from the visitor ZIP, highlight nearby venues, then zoom out to browse outside the current location and trace previous promoted shows."
                emptyRouteLabel="No previous promoted shows are mapped yet."
                routeLabel="Promoted history"
                routeStops={globeRouteStops}
                title="Earth globe for nearby venues and promoted-show history"
                venues={venues}
                viewerLocation={viewerLocation}
              />

              <div className="grid grid-2">
                {recentShows.length ? (
                  recentShows.map((show) => (
                    <div key={show.id} className="stat">
                      <strong>{show.title}</strong>
                      {show.venueProfile?.name ? `${show.venueProfile.name} · ` : ''}
                      {formatShowDate(show.startsAt)}
                    </div>
                  ))
                ) : (
                  <div className="empty">No event history yet.</div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
