import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NotificationsList } from '@/components/NotificationsList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Notifications · iHYPE',
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/me/notifications');

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, type: true, body: true, read: true, link: true, createdAt: true },
  });

  return (
    <NotificationsList
      initialNotifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
    />
  );
}
