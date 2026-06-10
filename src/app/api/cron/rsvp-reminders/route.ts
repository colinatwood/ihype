import { NextRequest, NextResponse } from 'next/server';
import { isCronRequestAuthorized } from '@/lib/cron-auth';
import { db } from '@/lib/db';
import { sendPushNotification } from '@/lib/push-notify';
import { sendGenericEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

// Workers queue outbound connections beyond 6, so this only bounds memory and
// keeps a single bad batch from consuming the whole wall-clock budget.
const SEND_CHUNK_SIZE = 25;
const DEDUP_QUERY_CHUNK_SIZE = 500;

type ReminderTask = {
  userId: string;
  dedupKey: string;
  notificationBody: string;
  link: string;
  push: { title: string; body: string; url: string };
  email?: { to: string; subject: string; text: string; html: string };
};

// The dedup key embeds show + user, so matching on `type` alone is exact.
async function filterAlreadyNotified(tasks: ReminderTask[]): Promise<ReminderTask[]> {
  const pending: ReminderTask[] = [];
  for (let i = 0; i < tasks.length; i += DEDUP_QUERY_CHUNK_SIZE) {
    const chunk = tasks.slice(i, i + DEDUP_QUERY_CHUNK_SIZE);
    const existing = await db.notification.findMany({
      where: { type: { in: chunk.map((t) => t.dedupKey) } },
      select: { type: true },
    });
    const seen = new Set(existing.map((n) => n.type));
    pending.push(...chunk.filter((t) => !seen.has(t.dedupKey)));
  }
  return pending;
}

async function deliver(tasks: ReminderTask[]): Promise<number> {
  let sent = 0;
  for (let i = 0; i < tasks.length; i += SEND_CHUNK_SIZE) {
    const chunk = tasks.slice(i, i + SEND_CHUNK_SIZE);
    await Promise.allSettled(
      chunk.map(async (task) => {
        await sendPushNotification(task.userId, task.push).catch(() => {});
        if (task.email) {
          await sendGenericEmail(task.email).catch(() => {});
        }
      })
    );
    await db.notification.createMany({
      data: chunk.map((t) => ({ userId: t.userId, type: t.dedupKey, body: t.notificationBody, link: t.link })),
    });
    sent += chunk.length;
  }
  return sent;
}

export async function GET(request: NextRequest) {
  try {
    if (!isCronRequestAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // 24h window: shows starting in 24h ± 30min
    const h24Low  = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const h24High = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    // 1h window: shows starting in 1h ± 15min
    const h1Low  = new Date(now.getTime() + 45 * 60 * 1000);
    const h1High = new Date(now.getTime() + 75 * 60 * 1000);

    const [shows24h, shows1h] = await Promise.all([
      db.show.findMany({
        where: { startsAt: { gte: h24Low, lte: h24High }, status: 'SCHEDULED' },
        include: {
          rsvps: { include: { user: { select: { id: true, email: true, emailBounced: true } } } },
          venueProfile: { select: { name: true } },
        },
      }),
      db.show.findMany({
        where: { startsAt: { gte: h1Low, lte: h1High }, status: 'SCHEDULED' },
        include: {
          rsvps: { include: { user: { select: { id: true } } } },
          venueProfile: { select: { name: true } },
        },
      }),
    ]);

    // 24h reminders: push + email
    const tasks24h: ReminderTask[] = shows24h.flatMap((show) => {
      const venueName = show.venueProfile?.name ?? 'Unknown venue';
      const dateStr = new Date(show.startsAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

      return show.rsvps.map((rsvp): ReminderTask => ({
        userId: rsvp.userId,
        dedupKey: `rsvp-24h:${show.id}:${rsvp.userId}`,
        notificationBody: `Tomorrow: ${show.title} @ ${venueName}`,
        link: `/shows/${show.slug}`,
        push: {
          title: `Tomorrow: ${show.title}`,
          body: `${show.title} @ ${venueName} on ${dateStr}`,
          url: `/shows/${show.slug}`,
        },
        email: rsvp.user.email && !rsvp.user.emailBounced
          ? {
              to: rsvp.user.email,
              subject: `Reminder: ${show.title} is tomorrow`,
              text: `Your show "${show.title}" at ${venueName} is tomorrow (${dateStr}). See you there!\n\nhttps://ihype.org/shows/${show.slug}`,
              html: `<p>Your show <strong>${show.title}</strong> at ${venueName} is <strong>tomorrow (${dateStr})</strong>.</p><p><a href="https://ihype.org/shows/${show.slug}">View on iHYPE →</a></p>`,
            }
          : undefined,
      }));
    });

    // 1h reminders: push only
    const tasks1h: ReminderTask[] = shows1h.flatMap((show) => {
      const venueName = show.venueProfile?.name ?? 'Unknown venue';

      return show.rsvps.map((rsvp): ReminderTask => ({
        userId: rsvp.userId,
        dedupKey: `rsvp-1h:${show.id}:${rsvp.userId}`,
        notificationBody: `Starting soon: ${show.title} is in 1 hour!`,
        link: `/shows/${show.slug}`,
        push: {
          title: `Starting soon: ${show.title}`,
          body: `${show.title} @ ${venueName} is in 1 hour!`,
          url: `/shows/${show.slug}`,
        },
      }));
    });

    const [pending24h, pending1h] = await Promise.all([
      filterAlreadyNotified(tasks24h),
      filterAlreadyNotified(tasks1h),
    ]);

    const sent24 = await deliver(pending24h);
    const sent1 = await deliver(pending1h);

    return NextResponse.json({ ok: true, sent24h: sent24, sent1h: sent1 });
  } catch (err) {
    console.error('[cron/rsvp-reminders] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
