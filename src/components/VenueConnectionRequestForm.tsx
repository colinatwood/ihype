'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BookableProfile = {
  id: string;
  name: string;
  type: string;
};

function getBookableProfileLabel(type: string) {
  return type === 'DJ' ? 'PROMOTER' : type;
}

type VenueConnectionRequestFormProps = {
  venueProfileId: string;
  bookableProfiles: BookableProfile[];
};

const initialFormState = {
  requesterType: 'LISTENER',
  artistProfileId: '',
  artistName: '',
  note: '',
  notifyOnBooking: false
} as const;

export function VenueConnectionRequestForm({
  venueProfileId,
  bookableProfiles
}: VenueConnectionRequestFormProps) {
  const router = useRouter();
  const [requesterType, setRequesterType] = useState<'LISTENER' | 'PROMOTER'>(initialFormState.requesterType);
  const [artistProfileId, setArtistProfileId] = useState<string>(initialFormState.artistProfileId);
  const [artistName, setArtistName] = useState<string>(initialFormState.artistName);
  const [note, setNote] = useState<string>(initialFormState.note);
  const [notifyOnBooking, setNotifyOnBooking] = useState<boolean>(initialFormState.notifyOnBooking);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const response = await fetch('/api/venue-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueProfileId,
        requesterType,
        artistProfileId: artistProfileId || undefined,
        artistName: artistName.trim() || undefined,
        note: note.trim() || undefined,
        notifyOnBooking
      })
    });

    const data = await response.json();

    if (response.ok) {
      setRequesterType(initialFormState.requesterType);
      setArtistProfileId(initialFormState.artistProfileId);
      setArtistName(initialFormState.artistName);
      setNote(initialFormState.note);
      setNotifyOnBooking(initialFormState.notifyOnBooking);
      setMessage('Recommendation sent. The venue owner can now review it.');
      router.refresh();
    } else {
      setMessage(data.error ?? 'Could not send this recommendation');
    }

    setPending(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>You are acting as</span>
        <select value={requesterType} onChange={(event) => setRequesterType(event.target.value as 'LISTENER' | 'PROMOTER')}>
          <option value="LISTENER">Listener</option>
          <option value="PROMOTER">Promoter</option>
        </select>
      </label>

      <label className="field">
        <span>Existing artist or promoter profile (optional)</span>
        <select value={artistProfileId} onChange={(event) => setArtistProfileId(event.target.value)}>
          <option value="">Choose a profile</option>
          {bookableProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({getBookableProfileLabel(profile.type)})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Artist or band to recommend</span>
        <input
          value={artistName}
          onChange={(event) => setArtistName(event.target.value)}
          placeholder="Recommend booking this band"
        />
      </label>

      <label className="field">
        <span>Why this act fits the room</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Let the venue know what makes this act a fit."
        />
      </label>

      <label className="checkbox-row">
        <input
          checked={notifyOnBooking}
          onChange={(event) => setNotifyOnBooking(event.target.checked)}
          type="checkbox"
        />
        <span>Let me know when you book them.</span>
      </label>

      <div className="cta-row">
        <button className="button" disabled={pending} type="submit">
          {pending ? 'Sending...' : 'Send recommendation'}
        </button>
        {message ? <span className="meta">{message}</span> : null}
      </div>
    </form>
  );
}
