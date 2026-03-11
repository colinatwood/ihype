import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatShowTime } from '@/lib/utils';
import { HypeButton } from '@/components/HypeButton';
import { TicketSaleCard } from '@/components/TicketSaleCard';
import { getShowVisibilitySignals } from '@/lib/integrity';
import { formatCurrencyFromCents } from '@/lib/ticketing';

export default async function ShowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = await db.show.findUnique({
    where: { slug },
    include: {
      venueProfile: true,
      headlinerProfile: true,
      promoterProfile: true,
      ticketOrders: {
        orderBy: { createdAt: 'desc' },
        take: 6
      }
    }
  });

  if (!show) return notFound();
  const visibility = getShowVisibilitySignals(show);

  const playbackUrl = show.streamPlaybackId
    ? `https://stream.mux.com/${show.streamPlaybackId}.m3u8`
    : null;

  return (
    <main className="container section">
      <div className="profile-header">
        <div className="badge">{show.status}</div>
        <h1 className="title" style={{ fontSize: '2.7rem' }}>{show.title}</h1>
        <p className="subtitle">{show.description}</p>
        <p className="meta">
          {formatShowTime(show.startsAt)}
          {show.venueProfile ? ` • ${show.venueProfile.name}` : ''}
          {show.headlinerProfile ? ` • ${show.headlinerProfile.name}` : ''}
        </p>
      </div>

      <div className="grid grid-2">
        <section className="panel" style={{ padding: '1rem' }}>
          <div className="video-shell">
            {playbackUrl ? (
              <video className="video-frame" controls playsInline autoPlay muted={show.status === 'LIVE'}>
                <source src={playbackUrl} type="application/x-mpegURL" />
              </video>
            ) : (
              <div className="show-art" style={{ minHeight: 320 }}>Connect your stream provider to go live</div>
            )}
          </div>
          <HypeButton targetType="show" targetId={show.id} initialCount={show.hypeCount} entityLabel="show" />
        </section>

        <aside className="panel" style={{ padding: '1.25rem' }}>
          <h2>Show details</h2>
          <div className="tag-row">
            {show.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
          <table className="table">
            <tbody>
              <tr><th>Status</th><td>{show.status}</td></tr>
              <tr><th>Stream provider</th><td>{show.streamProvider ?? 'Not configured'}</td></tr>
              <tr><th>Venue</th><td>{show.venueProfile?.name ?? 'TBA'}</td></tr>
              <tr><th>Headliner</th><td>{show.headlinerProfile?.name ?? 'TBA'}</td></tr>
              <tr><th>Promoter</th><td>{show.promoterProfile?.name ?? 'Promoter pool unassigned'}</td></tr>
              <tr><th>Ticketing</th><td>{show.isTicketed ? 'Enabled' : 'Not enabled'}</td></tr>
              {show.isTicketed ? (
                <>
                  <tr><th>Ticket price</th><td>{formatCurrencyFromCents(show.ticketPriceCents)}</td></tr>
                  <tr><th>Tickets sold</th><td>{show.ticketsSoldCount}</td></tr>
                  <tr><th>Capacity</th><td>{show.ticketCapacity ?? 'Open'}</td></tr>
                  <tr><th>Gross sales</th><td>{formatCurrencyFromCents(show.ticketPriceCents * show.ticketsSoldCount)}</td></tr>
                  <tr><th>Venue split</th><td>{show.venuePayoutPercent ?? 0}%</td></tr>
                  <tr><th>Artist split</th><td>{show.artistPayoutPercent ?? 0}%</td></tr>
                  <tr><th>Promoter pool</th><td>{show.promoterPayoutPercent}%</td></tr>
                </>
              ) : null}
              <tr><th>Hype</th><td>{show.hypeCount}</td></tr>
              <tr><th>Heuristics</th><td>{visibility.version}</td></tr>
            </tbody>
          </table>

          <div className="explanation-block">
            <h3>Why you&apos;re seeing this</h3>
            <ul className="launch-list">
              {visibility.reasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </div>
        </aside>
      </div>

      {show.isTicketed && show.venueProfile && show.headlinerProfile && show.venuePayoutPercent !== null && show.artistPayoutPercent !== null ? (
        <section className="section">
          <TicketSaleCard
            artistName={show.headlinerProfile.name}
            artistPayoutPercent={show.artistPayoutPercent}
            promoterName={show.promoterProfile?.name ?? null}
            promoterPayoutPercent={show.promoterPayoutPercent}
            showId={show.id}
            ticketCapacity={show.ticketCapacity}
            ticketPriceCents={show.ticketPriceCents}
            ticketsSoldCount={show.ticketsSoldCount}
            title={show.title}
            venueName={show.venueProfile.name}
            venuePayoutPercent={show.venuePayoutPercent}
          />
        </section>
      ) : null}

      {show.ticketOrders.length ? (
        <section className="section">
          <div className="panel" style={{ padding: '1.25rem' }}>
            <h2>Recent ticket orders</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Buyer</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Venue</th>
                  <th>Artist</th>
                  <th>Promoter</th>
                </tr>
              </thead>
              <tbody>
                {show.ticketOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.confirmationCode}</td>
                    <td>{order.buyerName}</td>
                    <td>{order.quantity}</td>
                    <td>{formatCurrencyFromCents(order.subtotalCents)}</td>
                    <td>{formatCurrencyFromCents(order.venuePayoutCents)}</td>
                    <td>{formatCurrencyFromCents(order.artistPayoutCents)}</td>
                    <td>{formatCurrencyFromCents(order.promoterPayoutCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
