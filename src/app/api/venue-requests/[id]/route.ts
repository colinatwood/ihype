import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { canManageOwnedResource } from '@/lib/permissions';

const schema = z.object({
  status: z.enum(['BOOKED', 'DISMISSED'])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = schema.parse(await request.json());

    const connectionRequest = await db.venueConnectionRequest.findUnique({
      where: { id },
      include: {
        venueProfile: {
          select: {
            ownerId: true
          }
        }
      }
    });

    if (!connectionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (!canManageOwnedResource(session, connectionRequest.venueProfile.ownerId)) {
      return NextResponse.json({ error: 'Only the venue owner can update this request' }, { status: 403 });
    }

    const updatedRequest = await db.venueConnectionRequest.update({
      where: { id },
      data: {
        status: body.status,
        respondedAt: new Date()
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Could not update this request' }, { status: 500 });
  }
}
