import { db } from '@/lib/db';
import { sendPushNotification } from '@/lib/push-notify';

/**
 * Records an in-app Notification and best-effort sends a web push for it.
 * Both halves are wrapped so a notification never breaks the caller's flow —
 * notifications are always a side effect, never load-bearing.
 */
export async function notifyUser(
  userId: string,
  opts: { type: string; title: string; body: string; link?: string | null },
): Promise<void> {
  await db.notification.create({
    data: { userId, type: opts.type, body: opts.body, link: opts.link ?? null },
  }).catch(() => {});
  await sendPushNotification(userId, {
    title: opts.title,
    body: opts.body,
    url: opts.link ?? undefined,
  }).catch(() => {});
}
