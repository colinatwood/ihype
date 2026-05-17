import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { id } = await params;
  const { status } = await request.json() as { status?: string };
  if (!['accepted', 'declined'].includes(status ?? '')) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  const req = await db.bookingRequest.findUnique({ where: { id }, include: { toProfile: { select: { ownerId: true, name: true } } } });
  if (!req) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (req.toProfile.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  const updated = await db.bookingRequest.update({ where: { id }, data: { status: status! } });
  await db.notification.create({ data: { userId: req.fromUserId, type: 'booking_response', body: `Your booking request for ${req.toProfile.name} was ${status}.`, link: '/home?tab=bookings' } }).catch(() => {});
  return NextResponse.json({ ok: true, bookingRequest: updated });
}
