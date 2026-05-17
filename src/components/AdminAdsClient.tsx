'use client';

import { useState } from 'react';

interface Ad {
  id: string;
  advertiserName: string;
  advertiserType: string;
  campaignWebsite: string;
  adTextCopy: string;
  status: string;
  aiReasoning: string | null;
  createdAt: Date;
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'success',
  rejected: 'error',
  manual_review: 'warning',
  pending: 'info',
};

export function AdminAdsClient({ ads: initial }: { ads: Ad[] }) {
  const [ads, setAds] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setLoading(id);
    const res = await fetch('/api/admin/ads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
    setLoading(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ads.length === 0 && <p className="empty">No submissions yet.</p>}
      {ads.map((ad) => (
        <div className="panel" key={ad.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>{ad.advertiserName}</strong>
              <span className="meta" style={{ marginLeft: 8 }}>{ad.advertiserType}</span>
            </div>
            <span className={`badge ${STATUS_COLORS[ad.status] ?? ''}`}>{ad.status}</span>
          </div>
          <p className="meta">
            <a href={ad.campaignWebsite} rel="noopener noreferrer" target="_blank">{ad.campaignWebsite}</a>
          </p>
          <p>&ldquo;{ad.adTextCopy}&rdquo;</p>
          {ad.aiReasoning && <p className="meta">AI: {ad.aiReasoning}</p>}
          <p className="meta">{new Date(ad.createdAt).toLocaleString()}</p>
          {(ad.status === 'manual_review' || ad.status === 'pending') && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="button small" disabled={loading === ad.id} onClick={() => updateStatus(ad.id, 'approved')}>
                Approve
              </button>
              <button className="button small secondary" disabled={loading === ad.id} onClick={() => updateStatus(ad.id, 'rejected')}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
