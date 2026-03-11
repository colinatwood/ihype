import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatCurrencyFromCents } from '@/lib/ticketing';

function formatRequesterType(value: 'LISTENER' | 'PROMOTER') {
  return value === 'LISTENER' ? 'Listener' : 'Promoter';
}

function formatRequestStatus(value: 'PENDING' | 'BOOKED' | 'DISMISSED') {
  if (value === 'BOOKED') return 'Booked';
  if (value === 'DISMISSED') return 'Dismissed';
  return 'Pending';
}

function getProfilePath(type: ProfileType, slug: string) {
  if (type === 'DJ') return `/promoters/${slug}`;
  if (type === 'VENUE') return `/venues/${slug}`;
  if (type === 'LISTENER') return `/listeners/${slug}`;
  return `/artists/${slug}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [profiles, shows, venueConnectionRequests, sentRecommendations] = await Promise.all([
    db.profile.findMany({ where: { ownerId: session.user.id }, orderBy: { createdAt: 'desc' } }),
    db.show.findMany({ where: { creatorId: session.user.id }, orderBy: { createdAt: 'desc' } }),
    db.venueConnectionRequest.findMany({
      where: { venueProfile: { ownerId: session.user.id } },
      include: { venueProfile: true, requester: true, artistProfile: true },
      orderBy: { createdAt: 'desc' }
    }),
    db.venueConnectionRequest.findMany({
      where: { requesterId: session.user.id },
      include: { venueProfile: true, artistProfile: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <main className="container section">
      <div className="panel" style={{ padding: '1.5rem' }}>
        <h1>Dashboard</h1>
        <p className="kicker">Manage accounts, shows, hype, and venue connection requests without pretending spreadsheets are a product strategy.</p>
      </div>

      <section className="section grid grid-2">
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2>Your profiles</h2>
          {profiles.length ? (
            <table className="table">
              <thead><tr><th>Name</th><th>Type</th><th>Slug</th><th>Hype</th><th>Page</th></tr></thead>
              <tbody>{profiles.map((profile) => <tr key={profile.id}><td>{profile.name}</td><td>{profile.type}</td><td>{profile.slug}</td><td>{profile.hypeCount}</td><td><Link href={getProfilePath(profile.type, profile.slug)}>Open page</Link></td></tr>)}</tbody>
            </table>
          ) : <div className="empty">Create creator and venue profiles with Prisma or extend the dashboard form.</div>}
        </div>

        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2>Your shows</h2>
          {shows.length ? (
            <table className="table">
              <thead><tr><th>Title</th><th>Status</th><th>Ticketing</th><th>Sold</th><th>Gross</th><th>Hype</th></tr></thead>
              <tbody>{shows.map((show) => <tr key={show.id}><td>{show.title}</td><td>{show.status}</td><td>{show.isTicketed ? formatCurrencyFromCents(show.ticketPriceCents) : 'Off'}</td><td>{show.ticketsSoldCount}</td><td>{show.isTicketed ? formatCurrencyFromCents(show.ticketPriceCents * show.ticketsSoldCount) : 'n/a'}</td><td>{show.hypeCount}</td></tr>)}</tbody>
            </table>
          ) : <div className="empty">No shows yet. Use the API route or build out this form to create them.</div>}
        </div>
      </section>

      <section className="section">
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2>Venue connection requests</h2>
          {venueConnectionRequests.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Recommended act</th>
                  <th>From</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Notify</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {venueConnectionRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.venueProfile.name}</td>
                    <td>{request.artistProfile?.name ?? request.artistName}</td>
                    <td>{request.requester.email}</td>
                    <td>{formatRequesterType(request.requesterType)}</td>
                    <td>{formatRequestStatus(request.status)}</td>
                    <td>{request.notifyOnBooking ? 'Yes' : 'No'}</td>
                    <td>{request.note ?? 'No note provided'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">No one has sent venue connection requests yet.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2>Recommendations you sent</h2>
          {sentRecommendations.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Recommended act</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Notify</th>
                </tr>
              </thead>
              <tbody>
                {sentRecommendations.map((request) => (
                  <tr key={request.id}>
                    <td>{request.venueProfile.name}</td>
                    <td>{request.artistProfile?.name ?? request.artistName}</td>
                    <td>{formatRequesterType(request.requesterType)}</td>
                    <td>{formatRequestStatus(request.status)}</td>
                    <td>{request.notifyOnBooking ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">You have not sent any venue recommendations yet.</div>
          )}
        </div>
      </section>

      <section className="section grid grid-2">
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2>Create a show</h2>
          <p className="kicker">Venue owners can now schedule ticketed shows from their venue page request section. The API also accepts ticketing fields and fixed promoter-pool splits.</p>
        </div>
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2>Create live stream infrastructure</h2>
          <p className="kicker">POST to <code>/api/live</code> with a showId to create a Mux live stream and store the playback ID.</p>
        </div>
      </section>
    </main>
  );
}
