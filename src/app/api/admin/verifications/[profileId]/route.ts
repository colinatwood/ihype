import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordAuditEvent } from '@/lib/audit';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminSession } from '@/lib/permissions';
import { readClientAddress } from '@/lib/request-meta';

const schema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'UNVERIFIED']),
  notes: z.string().trim().max(1000).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const session = await auth();

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { profileId } = await params;
    const body = schema.parse(await request.json());

    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: { id: true, type: true, name: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updatedProfile = await db.profile.update({
      where: { id: profileId },
      data: {
        verified: body.status === 'VERIFIED',
        verificationStatus: body.status,
        verificationReviewedAt: new Date(),
        verificationNotes: body.notes ?? undefined
      },
      select: {
        id: true,
        name: true,
        type: true,
        verified: true,
        verificationStatus: true,
        verificationNotes: true
      }
    });

    await recordAuditEvent({
      actorUserId: session?.user?.id,
      action: 'profile_verification_reviewed',
      entityType: 'profile',
      entityId: profileId,
      ipAddress: readClientAddress(request),
      metadata: {
        status: body.status,
        profileType: profile.type,
        profileName: profile.name
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid verification action' }, { status: 400 });
    }

    console.error('Verification review failed', error);
    return NextResponse.json({ error: 'Could not update verification' }, { status: 500 });
  }
}
