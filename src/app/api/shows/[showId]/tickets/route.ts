import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { calculateTicketOrderPayouts } from '@/lib/ticketing';

const schema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  quantity: z.coerce.number().int().min(1).max(8)
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const body = schema.parse(await request.json());

    const show = await db.show.findUnique({
      where: { id: showId },
      include: {
        venueProfile: true,
        headlinerProfile: true,
        promoterProfile: true
      }
    });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    if (!show.isTicketed || !show.ticketPriceCents || show.venuePayoutPercent === null || show.artistPayoutPercent === null) {
      return NextResponse.json({ error: 'This show is not configured for ticket sales' }, { status: 400 });
    }

    if (!['SCHEDULED', 'LIVE'].includes(show.status)) {
      return NextResponse.json({ error: 'Tickets are only available for scheduled or live shows' }, { status: 400 });
    }

    if (show.ticketCapacity !== null && show.ticketsSoldCount + body.quantity > show.ticketCapacity) {
      return NextResponse.json({ error: 'Not enough tickets remain for this order' }, { status: 400 });
    }

    const payouts = calculateTicketOrderPayouts({
      ticketPriceCents: show.ticketPriceCents,
      quantity: body.quantity,
      venuePayoutPercent: show.venuePayoutPercent,
      artistPayoutPercent: show.artistPayoutPercent,
      promoterPayoutPercent: show.promoterPayoutPercent
    });

    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.ticketOrder.create({
        data: {
          confirmationCode: randomUUID().split('-')[0].toUpperCase(),
          showId: show.id,
          buyerName: body.buyerName.trim(),
          buyerEmail: body.buyerEmail.trim().toLowerCase(),
          quantity: body.quantity,
          subtotalCents: payouts.subtotalCents,
          venuePayoutCents: payouts.venuePayoutCents,
          artistPayoutCents: payouts.artistPayoutCents,
          promoterPayoutCents: payouts.promoterPayoutCents
        }
      });

      await tx.show.update({
        where: { id: show.id },
        data: {
          ticketsSoldCount: {
            increment: body.quantity
          }
        }
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        order,
        payouts,
        message: `Tickets confirmed for ${show.title}. No platform commission was taken from this order.`
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid order payload' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Could not complete this ticket order' }, { status: 500 });
  }
}
