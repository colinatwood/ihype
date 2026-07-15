'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ConnectionRequest = {
  id: string;
  artistName: string;
  note: string | null;
  requesterType: 'LISTENER' | 'PROMOTER';
  createdAt: string;
  artistProfile: { slug: string } | null;
};

export function VenueRecommendationsPanel() {
  const [requests, setRequests] = useState<ConnectionRequest[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/venue-requests')
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => setRequests([]));
  }, []);

  async function respond(id: string, status: 'BOOKED' | 'DISMISSED') {
    setBusyId(id);
    try {
      const res = await fetch(`/api/venue-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) => (prev ?? []).filter((r) => r.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (requests === null || requests.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <span className="booking-eyebrow">RECOMMENDED BY THE COMMUNITY</span>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--ink-a60)', margin: '6px 0 14px' }}>
        Fans and promoters sent these artist recommendations directly to your venue.
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {requests.map((r) => (
          <li className="booking-card" key={r.id} style={{ alignItems: 'flex-start' }}>
            <div className="booking-card-body">
              {r.artistProfile ? (
                <Link className="booking-card-name" href={`/artists/${r.artistProfile.slug}`}>{r.artistName}</Link>
              ) : (
                <span className="booking-card-name">{r.artistName}</span>
              )}
              <div className="booking-card-meta">
                Recommended by a {r.requesterType === 'PROMOTER' ? 'promoter' : 'fan'} · {new Date(r.createdAt).toLocaleDateString()}
              </div>
              {r.note && <div className="booking-card-meta" style={{ marginTop: 4 }}>&ldquo;{r.note}&rdquo;</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                className="booking-cta"
                disabled={busyId === r.id}
                onClick={() => respond(r.id, 'BOOKED')}
                style={{ border: 'none', cursor: 'pointer' }}
                type="button"
              >
                Booked it
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => respond(r.id, 'DISMISSED')}
                style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 9999, padding: '9px 16px', color: 'var(--ink-a60)', cursor: 'pointer', fontSize: 13 }}
                type="button"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
