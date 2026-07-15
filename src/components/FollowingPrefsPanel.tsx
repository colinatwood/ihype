'use client';

import { useEffect, useState } from 'react';

type FollowPref = { profileId: string; name: string; slug: string; notifyShows: boolean };

export function FollowingPrefsPanel() {
  const [follows, setFollows] = useState<FollowPref[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/follow/prefs')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setFollows(d.follows ?? []))
      .catch(() => setError(true));
  }, []);

  async function toggle(profileId: string, notifyShows: boolean) {
    setFollows((prev) => (prev ?? []).map((f) => (f.profileId === profileId ? { ...f, notifyShows } : f)));
    const res = await fetch('/api/follow/prefs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, notifyShows }),
    });
    if (!res.ok) {
      setFollows((prev) => (prev ?? []).map((f) => (f.profileId === profileId ? { ...f, notifyShows: !notifyShows } : f)));
    }
  }

  if (error) return null;
  if (!follows || follows.length === 0) return null;

  return (
    <div className="settings-section">
      <div className="settings-section-title">Following ({follows.length})</div>
      <div className="settings-group">
        {follows.map((f) => (
          <div className="settings-row" key={f.profileId}>
            <div>
              <div className="settings-row-label">{f.name}</div>
              <div className="settings-row-detail">Notify me when they announce a show</div>
            </div>
            <label className="settings-toggle">
              <input checked={f.notifyShows} onChange={(e) => toggle(f.profileId, e.target.checked)} type="checkbox" />
              <div className="settings-toggle-track" />
              <div className="settings-toggle-thumb" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
