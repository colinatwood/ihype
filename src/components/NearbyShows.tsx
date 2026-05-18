'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Show = { id: string; slug: string; title: string; startsAt: string; hypeCount: number; venueProfile?: { name: string; city: string } | null; venueName?: string; venueCity?: string };

export function NearbyShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) { fetch('/api/shows/nearby').then(r => r.json()).then(d => { setShows(d.shows ?? []); setLoading(false); }); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetch(`/api/shows/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`).then(r => r.json()).then(d => { setShows(d.shows ?? []); setLoading(false); });
      },
      () => { fetch('/api/shows/nearby').then(r => r.json()).then(d => { setShows(d.shows ?? []); setLoading(false); }); }
    );
  }, []);

  if (loading) return <div className="meta">Finding shows near you…</div>;
  if (shows.length === 0) return <div className="meta">No upcoming shows found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {shows.map(s => (
        <Link key={s.id} href={`/shows/${s.slug}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{s.title}</div>
            <div className="meta">{s.venueProfile?.city ?? s.venueCity ?? ''} · {new Date(s.startsAt).toLocaleDateString()}</div>
          </div>
          <div className="meta">{s.hypeCount} hypes</div>
        </Link>
      ))}
    </div>
  );
}
