import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/permissions';
import { AdminNav } from '@/components/AdminNav';
import { AdminAdsClient } from '@/components/AdminAdsClient';

export default async function AdminAdsPage() {
  const session = await auth();
  if (!isAdminSession(session)) redirect('/');

  const ads = await db.adSubmission.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="container section">
      <AdminNav active="ads" />
      <h1 className="title">Supporter Submissions</h1>
      <AdminAdsClient ads={ads} />
    </main>
  );
}
