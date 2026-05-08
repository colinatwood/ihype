'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED' | 'HIDDEN';
type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNVERIFIED';

async function patchJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Action failed.');
  }

  return payload;
}

export function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<ReportStatus | null>(null);
  const [error, setError] = useState('');

  async function run(status: ReportStatus) {
    setPendingStatus(status);
    setError('');

    try {
      await patchJson(`/api/admin/content-reports/${reportId}`, { status });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="admin-action-row">
      {(['REVIEWED', 'RESOLVED', 'DISMISSED', 'HIDDEN'] as const).map((status) => (
        <button
          className={status === 'HIDDEN' ? 'button small danger' : 'button small secondary'}
          disabled={Boolean(pendingStatus)}
          key={status}
          onClick={() => run(status)}
          type="button"
        >
          {pendingStatus === status ? 'Saving...' : status}
        </button>
      ))}
      {error ? <small className="status-note status-note-error">{error}</small> : null}
    </div>
  );
}

export function AdminVerificationActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState('');

  async function run(status: VerificationStatus) {
    setPendingStatus(status);
    setError('');

    try {
      await patchJson(`/api/admin/verifications/${profileId}`, { status });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="admin-action-row">
      <button className="button small secondary" disabled={Boolean(pendingStatus)} onClick={() => run('VERIFIED')} type="button">
        {pendingStatus === 'VERIFIED' ? 'Saving...' : 'Approve'}
      </button>
      <button className="button small danger" disabled={Boolean(pendingStatus)} onClick={() => run('REJECTED')} type="button">
        {pendingStatus === 'REJECTED' ? 'Saving...' : 'Reject'}
      </button>
      {error ? <small className="status-note status-note-error">{error}</small> : null}
    </div>
  );
}
