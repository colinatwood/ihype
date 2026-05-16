import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/permissions';
import { AdminNav } from '@/components/AdminNav';
import { AdminBroadcastForm } from '@/components/AdminBroadcastForm';

export const metadata: Metadata = {
  title: 'Broadcast email | iHYPE Admin',
  robots: { index: false, follow: false }
};

export default async function AdminBroadcastPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminSession(session)) redirect('/auth/landing');

  return (
    <main className="container section admin-console">
      <AdminNav active="broadcast" />
      <section className="panel admin-console-hero">
        <div>
          <div className="badge">Broadcast</div>
          <h1>Send broadcast email</h1>
          <p className="subtitle">Send a message to all users or a specific role. Rate limited to 1/hour.</p>
        </div>
      </section>
      <section className="panel admin-console-panel">
        <AdminBroadcastForm />
      </section>
    </main>
  );
}
