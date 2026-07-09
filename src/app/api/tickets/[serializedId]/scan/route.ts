import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { canManageOwnedResource } from '@/lib/permissions';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ serializedId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { serializedId } = await params;
  const ticket = await db.ticket.findUnique({
    where: { serializedId },
    include: {
      venueProfile: {
        select: {
          ownerId: true
        }
      }
    }
  });

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  if (!ticket.venueProfile || !canManageOwnedResource(session, ticket.venueProfile.ownerId)) {
    return NextResponse.json({ error: 'Only the venue owner or admin can scan tickets.' }, { status: 403 });
  }

  const scannedAt = new Date();
  const result = await db.ticket.updateMany({
    where: {
      id: ticket.id,
      status: 'VALID'
    },
    data: {
      status: 'SCANNED',
      scannedAt,
      scannedByUserId: session.user.id
    }
  });

  if (result.count !== 1) {
    return NextResponse.json(
      { error: 'This ticket was already scanned or is no longer valid for entry.' },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    scannedAt: scannedAt.toISOString(),
    message: 'Ticket verified and marked as scanned.'
  });
}
