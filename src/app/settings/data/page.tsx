import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata: Metadata = { title: 'Data Export · Settings · iHYPE' };

export default async function DataExportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="container section" style={{ maxWidth: 640 }}>
      <h1>Data export</h1>
      <p className="meta" style={{ marginBottom: 16 }}>
        Download a copy of your iHYPE data. The export includes your profile, hype events, follows, notifications, and seeds.
      </p>
      <form action="/api/settings/data-export" method="POST">
        <button className="button" type="submit">
          Request data export
        </button>
      </form>
      <p style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--ink-3)', marginTop: 12 }}>
        The file will download as JSON. No account changes are made.
      </p>
    </main>
  );
}
