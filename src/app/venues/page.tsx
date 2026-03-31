import Link from 'next/link';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  DiscoverCreatorPanel,
  DiscoverRecommendationPanel,
  DiscoverStatsPanel
} from '@/components/DiscoverModulePanels';
import { ProfileDirectoryPage } from '@/components/ProfileDirectoryPage';
import { RoleModuleSubheader } from '@/components/RoleModuleSubheader';
import { VenueEventScheduler } from '@/components/VenueEventScheduler';
import {
  getTopMarketLabels,
  resolveDiscoverModule
} from '@/lib/discover-modules';
import { getDirectoryProfiles } from '@/lib/public-data';
import { ShowCard } from '@/components/ShowCard';

export const dynamic = 'force-dynamic';

export default async function VenuesIndexPage({
  searchParams
}: {
  searchParams?: Promise<{ module?: string | string[] }>;
}) {
  const session = await auth();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeModule = resolveDiscoverModule('venues', resolvedSearchParams.module);
  const venues = await getDirectoryProfiles('VENUE');

  const [venueShows, totalRequestCount] = await Promise.all([
    db.show.findMany({
      where: {
        status: { not: 'CANCELED' },
        venueProfileId: { not: null }
      },
      include: {
        venueProfile: true,
        headlinerProfile: true
      },
      orderBy: [{ startsAt: 'asc' }, { hypeCount: 'desc' }],
      take: 18
    }),
    db.venueConnectionRequest.count()
  ]);

  const totalVenueHype = venues.reduce((sum, venue) => sum + venue.hypeCount, 0);
  const totalTicketsSold = venueShows.reduce((sum, show) => sum + show.ticketsSoldCount, 0);
  const topMarkets = getTopMarketLabels(venues);

  let modulePanel: ReactNode;

  if (activeModule === 'stats') {
    modulePanel = (
      <DiscoverStatsPanel
        badge="Stats"
        description="See how many rooms are active, how tickets are moving, and where the strongest venue clusters are building."
        highlights={topMarkets}
        stats={[
          { label: 'Venues', value: venues.length },
          { label: 'Verified', value: venues.filter((venue) => venue.verified).length },
          { label: 'Live + upcoming shows', value: venueShows.filter((show) => show.status === 'LIVE' || show.status === 'SCHEDULED').length },
          { label: 'Venue hype', value: totalVenueHype },
          { label: 'Booking requests', value: totalRequestCount },
          { label: 'Tickets sold', value: totalTicketsSold }
        ]}
        title="Venue network stats"
      />
    );
  } else if (activeModule === 'recommendation-engine') {
    modulePanel = (
      <DiscoverRecommendationPanel
        badge="Recommendation engine"
        description="Use current venue demand and show movement to decide which artists, dates, and campaigns deserve the next push."
        opportunities={[
          {
            title: 'Lean into the strongest room market',
            summary: `${topMarkets[0] ?? 'The top current market'} is carrying the strongest venue density right now.`,
            detail: 'Package your best room visuals and upcoming nights around the city cluster already moving.'
          },
          {
            title: 'Book against demand',
            summary: `${totalRequestCount} requests have already been pushed toward venue pages in the current network snapshot.`,
            detail: 'Pair repeat request patterns with artist availability before the window cools off.'
          },
          {
            title: 'Promote the room as much as the lineup',
            summary: `${totalTicketsSold} tickets have already moved through venue-listed shows.`,
            detail: 'Lead campaigns with access, neighborhood convenience, and the headline night together.'
          }
        ]}
        title="Venue recommendation engine"
      />
    );
  } else {
    const ownedVenue =
      session?.user?.id
        ? await db.profile.findFirst({
            where: {
              ownerId: session.user.id,
              type: 'VENUE'
            },
            select: {
              id: true,
              name: true
            }
          })
        : null;

    if (ownedVenue) {
      const [bookableProfiles, connectionRequests] = await Promise.all([
        db.profile.findMany({
          where: { type: { in: ['ARTIST', 'DJ'] } },
          orderBy: [{ verified: 'desc' }, { name: 'asc' }],
          select: { id: true, name: true, type: true }
        }),
        db.venueConnectionRequest.findMany({
          where: {
            venueProfileId: ownedVenue.id,
            status: 'BOOKED',
            artistProfileId: { not: null }
          },
          include: {
            artistProfile: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        })
      ]);

      const bookedActs = Array.from(
        new Map(
          connectionRequests
            .filter((request) => request.artistProfile)
            .map((request) => [
              request.artistProfile!.id,
              {
                id: request.artistProfile!.id,
                name: request.artistProfile!.name,
                type: request.artistProfile!.type as 'ARTIST' | 'DJ'
              }
            ])
        ).values()
      );

      const promoterOptions = bookableProfiles
        .filter((bookableProfile) => bookableProfile.type === 'DJ')
        .map((bookableProfile) => ({ id: bookableProfile.id, name: bookableProfile.name }));

      modulePanel = (
        <DiscoverCreatorPanel
          badge="Event creator"
          description="Build the next venue event directly from your discover lane."
          title="Venue event creator"
        >
          <VenueEventScheduler
            bookedActs={bookedActs}
            promoterOptions={promoterOptions}
            venueProfileId={ownedVenue.id}
          />
        </DiscoverCreatorPanel>
      );
    } else {
      modulePanel = (
        <DiscoverCreatorPanel
          actionHref={session?.user ? '/dashboard' : '/login'}
          actionLabel={session?.user ? 'Open dashboard' : 'Sign in as venue'}
          badge="Event creator"
          description="Venue event scheduling opens once you are signed into a venue-owned profile."
          title="Venue event creator"
        >
          <div className="discover-creator-grid">
            <div className="discover-creator-column">
              <h3>Upcoming room nights</h3>
              {venueShows.length ? (
                <div className="grid grid-2">
                  {venueShows.slice(0, 4).map((show) => (
                    <ShowCard key={show.id} show={show} />
                  ))}
                </div>
              ) : (
                <div className="empty">No venue events are listed yet.</div>
              )}
            </div>

            <div className="discover-creator-column">
              <h3>Venue leaders</h3>
              <div className="discover-simple-list">
                {venues.slice(0, 5).map((venue) => (
                  <Link className="discover-simple-link" href={`/venues/${venue.slug}`} key={venue.id}>
                    <strong>{venue.name}</strong>
                    <span>{[venue.city, venue.stateRegion ?? venue.country].filter(Boolean).join(', ') || 'Location building'}</span>
                    <span>{venue.hypeCount} hype</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </DiscoverCreatorPanel>
      );
    }
  }

  return (
    <ProfileDirectoryPage
      badge="VENUES"
      currentHref="/venues"
      description="Venue discover keeps the focus on room performance, booking demand, and the nights that deserve a bigger push."
      modulePanel={modulePanel}
      moduleSubheader={<RoleModuleSubheader activeModule={activeModule} currentHref="/venues" role="venues" />}
      profiles={venues}
      title="Venue discover"
    />
  );
}
