'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type VenueConnectionRequestActionsProps = {
  requestId: string;
  currentStatus: 'PENDING' | 'BOOKED' | 'DISMISSED';
};

export function VenueConnectionRequestActions({
  requestId,
  currentStatus
}: VenueConnectionRequestActionsProps) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<'BOOKED' | 'DISMISSED' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(status: 'BOOKED' | 'DISMISSED') {
    setPendingStatus(status);
    setMessage(null);

    const response = await fetch(`/api/venue-requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(status === 'BOOKED' ? 'Marked as booked.' : 'Dismissed.');
      router.refresh();
    } else {
      setMessage(data.error ?? 'Could not update this request');
    }

    setPendingStatus(null);
  }

  if (currentStatus !== 'PENDING') {
    return message ? <span className="meta">{message}</span> : null;
  }

  return (
    <div className="request-actions">
      <button
        className="button small"
        disabled={pendingStatus !== null}
        onClick={() => updateStatus('BOOKED')}
        type="button"
      >
        {pendingStatus === 'BOOKED' ? 'Saving...' : 'Mark booked'}
      </button>
      <button
        className="button small secondary"
        disabled={pendingStatus !== null}
        onClick={() => updateStatus('DISMISSED')}
        type="button"
      >
        {pendingStatus === 'DISMISSED' ? 'Saving...' : 'Dismiss'}
      </button>
      {message ? <span className="meta">{message}</span> : null}
    </div>
  );
}
