import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordAuditEvent } from '@/lib/audit';
import { consumeRateLimit, rateLimitKey } from '@/lib/rate-limit';

// Fans and creators submit these from Support's Privacy panel. Each kind
// creates a staff-reviewed SupportRequest rather than performing an
// automated action — deletion and identity-detachment are irreversible,
// and hype-history wipes touch shared aggregate counters (show/profile
// hypeCount) that other users see, so none of these are safe to run as an
// instant, unreviewed bulk operation.
const KIND_COPY: Record<string, { subject: string; details: string; priority: string }> = {
  deletion: {
    subject: 'Account deletion request',
    details: 'User requested permanent account deletion via Support → Privacy. Erase profile, posts, and personal information within 30 days per the privacy policy.',
    priority: 'HIGH',
  },
  detach: {
    subject: 'Early identity detachment request',
    details: 'User requested early identity detachment (unlink email from activity log now, rather than the default 30-day window) via Support → Privacy.',
    priority: 'NORMAL',
  },
  'hype-wipe': {
    subject: 'Hype history wipe request',
    details: 'User requested their past hype votes be cleared without deleting their account, via Support → Privacy. Note: hype counts are shared aggregates on shows/profiles — review impact before wiping.',
    priority: 'NORMAL',
  },
};

const schema = z.object({ kind: z.enum(['deletion', 'detach', 'hype-wipe']) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const rl = await consumeRateLimit(rateLimitKey('privacy-request', session.user.id, null), { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests — try again later.' }, { status: 429 });

  let body: { kind?: string };
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const kind = body.kind as keyof typeof KIND_COPY;
  const copy = KIND_COPY[kind];

  const supportRequest = await db.supportRequest.create({
    data: {
      requesterUserId: session.user.id,
      type: `PRIVACY_${kind.toUpperCase().replace('-', '_')}`,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      subject: copy.subject,
      details: copy.details,
      priority: copy.priority,
    },
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    action: 'privacy_request_created',
    entityType: 'support',
    entityId: supportRequest.id,
    metadata: { kind },
  });

  return NextResponse.json({ id: supportRequest.id, status: supportRequest.status }, { status: 201 });
}
