import { db } from '@/lib/db';

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// TODO: install web-push package and configure VAPID keys to enable actual delivery.
// Currently stores subscriptions and logs notifications without sending.
export async function sendPushNotification(userId: string, payload: PushPayload): Promise<void> {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, auth: true, p256dh: true }
  });

  if (subscriptions.length === 0) return;

  // Attempt to use web-push if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webpush: any = await import('web-push' as string).catch(() => null);
    if (webpush) {
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:hello@ihype.org';

      if (vapidPublicKey && vapidPrivateKey) {
        const wp = webpush.default ?? webpush;
        wp.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        for (const sub of subscriptions) {
          await wp.sendNotification(
            { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
            JSON.stringify(payload)
          ).catch((err: unknown) => {
            console.warn('[push-notify] send failed:', err);
          });
        }
        return;
      }
    }
  } catch {
    // web-push not available
  }

  // Fallback: log intent
  console.info('[push-notify] TODO: send to', subscriptions.length, 'subscriptions for user', userId, payload);
}
