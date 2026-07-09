import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { constructWebhookEvent, isStripeConfigured } from '@/lib/stripe';
import { log } from '@/lib/logger';
import { finalizeCapturedTicketOrder, voidReservedTicketOrder } from '@/lib/ticket-order-state';
import { sendIssuedTicketEmail } from '@/lib/mailer';
import { formatCurrencyFromCents } from '@/lib/ticketing';
import {
  buildTicketQrCodeDataUrl,
  buildTicketVerificationUrl,
  formatTicketStatus,
} from '@/lib/tickets';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    console.error('[stripe/webhook] WARNING: Using test Stripe key in production!');
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });

  const payload = await request.text();
  let event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (error) {
    log.error('[stripe/webhook]', error instanceof Error ? error : null, 'Invalid webhook signature');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let finalizedOrderId: string | null = null;
  let duplicate = false;

  try {
    const result = await db.$transaction(async (tx) => {
      const existing = await tx.processedWebhookEvent.findUnique({
        where: { source_eventId: { source: 'stripe', eventId: event.id } },
        select: { id: true },
      });
      if (existing) return { duplicate: true, finalizedOrderId: null as string | null };

      let capturedOrderId: string | null = null;

      switch (event.type) {
        case 'payment_intent.amount_capturable_updated':
          break;

        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object;
          const orders = await tx.ticketOrder.findMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            select: { id: true },
          });
          for (const order of orders) await voidReservedTicketOrder(tx, order.id);
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          const order = await tx.ticketOrder.findUnique({
            where: { stripePaymentIntentId: paymentIntent.id },
            select: { id: true },
          });
          if (order) {
            const finalized = await finalizeCapturedTicketOrder(tx, order.id, new Date(event.created * 1000));
            if (finalized.changed) capturedOrderId = order.id;
          }
          break;
        }

        case 'account.updated': {
          const account = event.data.object;
          await tx.profile.updateMany({
            where: { stripeConnectAccountId: account.id },
            data: { stripeConnectOnboarded: account.charges_enabled },
          });
          break;
        }

        default:
          break;
      }

      await tx.processedWebhookEvent.create({
        data: { source: 'stripe', eventId: event.id },
      });
      return { duplicate: false, finalizedOrderId: capturedOrderId };
    });

    duplicate = result.duplicate;
    finalizedOrderId = result.finalizedOrderId;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      duplicate = true;
    } else {
      log.error('[stripe/webhook]', error instanceof Error ? error : null, `Processing failed for ${event.id}`);
      return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
    }
  }

  if (finalizedOrderId) {
    try {
      const order = await db.ticketOrder.findUnique({
        where: { id: finalizedOrderId },
        include: {
          tickets: true,
          show: {
            select: {
              title: true,
              ticketingOpensAt: true,
              venueProfile: { select: { name: true } },
            },
          },
        },
      });

      if (order) {
        const tickets = await Promise.all(
          order.tickets.map(async (ticket, index) => ({
            id: ticket.id,
            serializedId: ticket.serializedId,
            status: formatTicketStatus(ticket.status),
            verificationUrl: buildTicketVerificationUrl(ticket.serializedId),
            qrCodeDataUrl: await buildTicketQrCodeDataUrl(ticket.serializedId),
            label: `Ticket ${index + 1}`,
          })),
        );
        await sendIssuedTicketEmail({
          email: order.buyerEmail,
          name: order.buyerName,
          showTitle: order.show.title,
          venueName: order.show.venueProfile?.name,
          eventOpensAtLabel: order.show.ticketingOpensAt?.toLocaleString('en-US') ?? null,
          totalChargeLabel: formatCurrencyFromCents(order.totalChargeCents),
          tickets,
        });
      }
    } catch (error) {
      log.error('[stripe/webhook]', error instanceof Error ? error : null, `Ticket email failed for ${finalizedOrderId}`);
    }
  }

  return NextResponse.json({ received: true, duplicate });
}
