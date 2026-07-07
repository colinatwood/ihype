import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordAuditEvent } from '@/lib/audit';
import {
  generateUniqueProfileHexId,
  getProfileCopy,
  getProfileType,
  getVerificationStatusForType,
} from '@/lib/profile-creation';
import { generateUniqueNonwordSlug } from '@/lib/nonword-slug';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';
import { log } from '@/lib/logger';

const schema = z.object({
  role: z.enum(['ARTIST', 'DJ', 'VENUE']),
  name: z.string().trim().min(2).max(120),
});

/**
 * Lets an already-signed-in account add another page (artist/DJ/venue)
 * without going through the new-account signup flow — /api/register
 * always creates a brand new User, which fails for existing accounts.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const clientAddress = readClientAddress(request);
  const rateLimit = await consumeRateLimit(`add-profile:${session.user.id}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many pages created. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const body = schema.parse(await request.json());
    const trimmedName = body.name.trim();
    const profileType = getProfileType(body.role);
    const hexId = await generateUniqueProfileHexId();
    const slug = await generateUniqueNonwordSlug(db);

    const profile = await db.profile.create({
      data: {
        slug,
        hexId,
        type: profileType,
        name: trimmedName,
        ownerId: session.user.id,
        verificationStatus: getVerificationStatusForType(profileType),
        verificationSubmittedAt: new Date(),
        ...getProfileCopy(profileType, trimmedName),
      },
      select: { id: true, slug: true, name: true, type: true, hexId: true },
    });

    await recordAuditEvent({
      actorUserId: session.user.id,
      action: 'profile_added',
      entityType: 'profile',
      entityId: profile.id,
      ipAddress: clientAddress,
      metadata: { role: body.role },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      return NextResponse.json({ error: first?.message ?? 'Invalid page payload' }, { status: 400 });
    }
    log.error('[profiles]', error instanceof Error ? error : null, 'Could not create additional page');
    return NextResponse.json({ error: 'Could not create page. Please try again.' }, { status: 500 });
  }
}
