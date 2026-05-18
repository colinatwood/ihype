'use client';
import { useState } from 'react';

export function ModerationActions({ reportId }: { reportId: string }) {
  const [status, setStatus] = useState<'idle' | 'done'>('idle');

  async function act(action: 'approve' | 'dismiss') {
    await fetch(`/api/admin/moderation/${reportId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    setStatus('done');
  }

  if (status === 'done') return <span className="meta">Done</span>;
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="button small" onClick={() => act('approve')} type="button">Remove content</button>
      <button className="button small secondary" onClick={() => act('dismiss')} type="button">Dismiss</button>
    </div>
  );
}
