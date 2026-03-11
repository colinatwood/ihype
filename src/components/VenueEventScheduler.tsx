'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROMOTER_POOL_PERCENT, REMAINING_PAYOUT_PERCENT, formatPercent } from '@/lib/ticketing';

type BookedAct = {
  id: string;
  name: string;
  type: 'ARTIST' | 'DJ';
};

type PromoterOption = {
  id: string;
  name: string;
};

type VenueEventSchedulerProps = {
  venueProfileId: string;
  bookedActs: BookedAct[];
  promoterOptions: PromoterOption[];
};

export function VenueEventScheduler({
  venueProfileId,
  bookedActs,
  promoterOptions
}: VenueEventSchedulerProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [headlinerProfileId, setHeadlinerProfileId] = useState(bookedActs[0]?.id ?? '');
  const [promoterProfileId, setPromoterProfileId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [ticketPrice, setTicketPrice] = useState('25');
  const [ticketCapacity, setTicketCapacity] = useState('200');
  const [venuePayoutPercent, setVenuePayoutPercent] = useState('50');
  const [tags, setTags] = useState('ticketed, booked');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const venueShare = Number(venuePayoutPercent || 0);
  const artistShare = REMAINING_PAYOUT_PERCENT - venueShare;
  const hasBookedActs = bookedActs.length > 0;
  const selectedAct = useMemo(
    () => bookedActs.find((act) => act.id === headlinerProfileId) ?? null,
    [bookedActs, headlinerProfileId]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasBookedActs) {
      setMessage('Mark an artist request as booked before scheduling a ticketed event.');
      return;
    }

    if (!startsAt) {
      setMessage('Choose a start time for the event.');
      return;
    }

    if (artistShare < 0) {
      setMessage(`Venue share must leave ${formatPercent(REMAINING_PAYOUT_PERCENT)} combined for the venue and artist.`);
      return;
    }

    setPending(true);
    setMessage(null);

    const response = await fetch('/api/shows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        venueProfileId,
        headlinerProfileId,
        promoterProfileId: promoterProfileId || undefined,
        isTicketed: true,
        ticketPriceCents: Math.round(Number(ticketPrice || 0) * 100),
        ticketCapacity: Number(ticketCapacity || 0),
        venuePayoutPercent: venueShare,
        artistPayoutPercent: artistShare,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
    });

    const data = await response.json();

    if (response.ok) {
      setTitle('');
      setDescription('');
      setStartsAt('');
      setEndsAt('');
      setTicketPrice('25');
      setTicketCapacity('200');
      setVenuePayoutPercent('50');
      setTags('ticketed, booked');
      setMessage(`Event scheduled. Tickets are live for ${data.title}.`);
      router.refresh();
    } else {
      setMessage(data.error ?? 'Could not schedule this event.');
    }

    setPending(false);
  }

  return (
    <div className="panel ticketing-panel">
      <div className="ticketing-panel-header">
        <div>
          <div className="badge">Venue Scheduling</div>
          <h3>Schedule a ticketed event for a booked act</h3>
          <p className="kicker">
            Ticket sales keep platform commission at 0%. The promoter pool stays fixed at {formatPercent(PROMOTER_POOL_PERCENT)},
            and the venue plus artist split the remaining {formatPercent(REMAINING_PAYOUT_PERCENT)}.
          </p>
        </div>
      </div>

      {hasBookedActs ? (
        <form className="form" onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <label className="field">
              <span>Event title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Lakefront Frequency x South Loop Signal" required />
            </label>

            <label className="field">
              <span>Booked act</span>
              <select value={headlinerProfileId} onChange={(event) => setHeadlinerProfileId(event.target.value)} required>
                {bookedActs.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name} ({act.type === 'DJ' ? 'PROMOTER / DJ' : 'ARTIST'})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe the room, the lineup, and what the ticket includes."
            />
          </label>

          <div className="grid grid-2">
            <label className="field">
              <span>Start time</span>
              <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
            </label>

            <label className="field">
              <span>End time (optional)</span>
              <input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </label>
          </div>

          <div className="grid grid-3">
            <label className="field">
              <span>Ticket price (USD)</span>
              <input
                inputMode="decimal"
                min="1"
                step="0.01"
                type="number"
                value={ticketPrice}
                onChange={(event) => setTicketPrice(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Capacity</span>
              <input
                inputMode="numeric"
                min="1"
                step="1"
                type="number"
                value={ticketCapacity}
                onChange={(event) => setTicketCapacity(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Promoter profile (optional)</span>
              <select value={promoterProfileId} onChange={(event) => setPromoterProfileId(event.target.value)}>
                <option value="">Unassigned promoter pool</option>
                {promoterOptions.map((promoter) => (
                  <option key={promoter.id} value={promoter.id}>
                    {promoter.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-2">
            <label className="field">
              <span>Venue payout share (%)</span>
              <input
                inputMode="numeric"
                max={REMAINING_PAYOUT_PERCENT}
                min="0"
                step="1"
                type="number"
                value={venuePayoutPercent}
                onChange={(event) => setVenuePayoutPercent(event.target.value)}
                required
              />
            </label>

            <div className="ticketing-split-preview">
              <div className="meta">Split preview</div>
              <div className="signal-grid compact">
                <div className="signal-card">
                  <strong>Venue</strong>
                  <span>{formatPercent(Math.max(0, venueShare))}</span>
                </div>
                <div className="signal-card">
                  <strong>Artist</strong>
                  <span>{formatPercent(Math.max(0, artistShare))}</span>
                </div>
                <div className="signal-card">
                  <strong>Promoter pool</strong>
                  <span>{formatPercent(PROMOTER_POOL_PERCENT)}</span>
                </div>
              </div>
            </div>
          </div>

          <label className="field">
            <span>Tags</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="ticketed, chicago, house" />
          </label>

          {selectedAct ? (
            <div className="empty">
              Scheduling with <strong>{selectedAct.name}</strong>. Ticket revenue is split between the venue, the booked act,
              and the fixed promoter pool.
            </div>
          ) : null}

          <div className="cta-row">
            <button className="button" disabled={pending} type="submit">
              {pending ? 'Scheduling...' : 'Schedule event'}
            </button>
            {message ? <span className="meta">{message}</span> : null}
          </div>
        </form>
      ) : (
        <div className="empty">Mark a recommendation as booked to unlock event scheduling for that act.</div>
      )}
    </div>
  );
}
