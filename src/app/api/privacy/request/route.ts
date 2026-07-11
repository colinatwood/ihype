import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordAuditEvent } from '@/lib/audit';
import { consumeRateLimit, rateLimitKey } from '@/lib/rate-limit';
import { executeHypeWipe, executeIdentityDetach } from '@/lib/privacy-actions';

// Fans and creators submit these from Support's Privacy panel and Settings.
//
// - detach and hype-wipe EXECUTE IMMEDIATELY (privacy-actions.ts handles the
//   shared aggregate counters correctly), then file a DONE support request so
//   staff have a record.
// - deletion stays a staff-reviewed OPEN request: it is irreversible, and a
//   human confirms identity/intent before executeAccountErasure runs from the
//   admin console.
const KIND_COPY: Record<string, { subject: string; details: string; priority: string }> = {
  deletion: {
    subject: 'Account deletion request',
    details: 'User requested permanent account deletion via Support → Privacy. Execute from the admin console (erases profile, posts, and personal information) within 30 days per the privacy policy.',
    priority: 'HIGH',
  },
  detach: {
    subject: 'Early identity detachment (executed)',
    details: 'User requested early identity detachment. Executed automatically: IP/location metadata removed from their activity log ahead of the default 30-day window.',
    priority: 'NORMAL',
  },
  'hype-wipe': {
    subject: 'Hype history wipe (executed)',
    details: 'User requested their past hype votes be cleared without deleting their account. Executed automatically with aggregate counters decremented to match.',
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

  let executed = false;
  if (kind === 'detach') {
    await executeIdentityDetach(session.user.id);
    executed = true;
  } else if (kind === 'hype-wipe') {
    await executeHypeWipe(session.user.id);
    executed = true;
  }

  const supportRequest = await db.supportRequest.create({
    data: {
      requesterUserId: session.user.id,
      type: `PRIVACY_${kind.toUpperCase().replace('-', '_')}`,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      subject: copy.subject,
      details: copy.details,
      priority: copy.priority,
      status: executed ? 'DONE' : 'OPEN',
    },
  });

  await recordAuditEvent({
    actorUserId: session.user.id,
    action: 'privacy_request_created',
    entityType: 'support',
    entityId: supportRequest.id,
    metadata: { kind, executed },
  });

  return NextResponse.json({ id: supportRequest.id, status: supportRequest.status, executed }, { status: 201 });
}
