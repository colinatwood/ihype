import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { log } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_AD_WEBHOOK_SECRET;
  if (!stripeKey?.startsWith('sk_') || !webhookSecret) {
    return NextResponse.json({ error: 'Payment not configured.' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' });
  const signature = request.headers.get('stripe-signature') ?? '';
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    log.error('[ads/stripe-webhook]', error instanceof Error ? error : null, 'Invalid webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const duplicate = await db.$transaction(async (tx) => {
      const existing = await tx.processedWebhookEvent.findUnique({
        where: { source_eventId: { source: 'stripe-ads', eventId: event.id } },
        select: { id: true },
      });
      if (existing) return true;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const adId = session.metadata?.adId;
        if (adId) {
          await tx.adSubmission.update({ where: { id: adId }, data: { status: 'active' } });
          if (session.subscription) {
            await tx.auditLog.create({
              data: {
                actorUserId: null,
                action: 'AD_SUBSCRIPTION_CREATED',
                entityType: 'AdSubmission',
                entityId: adId,
                metadata: { stripeSubscriptionId: session.subscription as string },
              },
            });
          }
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const auditEntry = await tx.auditLog.findFirst({
          where: {
            action: 'AD_SUBSCRIPTION_CREATED',
            metadata: { path: ['stripeSubscriptionId'], equals: subscription.id },
          },
        });
        if (auditEntry?.entityId) {
          await tx.adSubmission.update({
            where: { id: auditEntry.entityId },
            data: { status: 'expired' },
          });
        }
      }

      await tx.processedWebhookEvent.create({
        data: { source: 'stripe-ads', eventId: event.id },
      });
      return false;
    });

    return NextResponse.json({ received: true, duplicate });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    log.error('[ads/stripe-webhook]', error instanceof Error ? error : null, `Processing failed for ${event.id}`);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
