import { NextResponse } from 'next/server';
import { renderSVG } from 'uqr';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serializedId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { serializedId } = await params;

  const ticket = await db.ticket.findFirst({
    where: { serializedId, ticketOrder: { buyerUserId: session.user.id } },
    select: { serializedId: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const target = `https://ihype.org/api/tickets/${serializedId}/scan`;
  const svg = renderSVG(target, { ecc: 'M', border: 2 });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
