import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { db } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature') ?? '';
  const body = await request.text();
  let event: Stripe.Event;
  try {
    const secret = process.env.STRIPE_AD_WEBHOOK_SECRET ?? '';
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const adId = session.metadata?.adId;
    if (adId) {
      await db.adSubmission.update({ where: { id: adId }, data: { status: 'active' } });
      // Record the subscription ID in audit log since AdSubmission has no stripeSubscriptionId field
      if (session.subscription) {
        await db.auditLog.create({
          data: {
            actorUserId: null,
            action: 'AD_SUBSCRIPTION_CREATED',
            entityType: 'AdSubmission',
            entityId: adId,
            metadata: { stripeSubscriptionId: session.subscription as string },
          }
        });
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    // Find adId from audit log
    const log = await db.auditLog.findFirst({
      where: { action: 'AD_SUBSCRIPTION_CREATED', metadata: { path: ['stripeSubscriptionId'], equals: sub.id } }
    });
    if (log?.entityId) {
      await db.adSubmission.update({ where: { id: log.entityId }, data: { status: 'expired' } });
    }
  }

  return NextResponse.json({ received: true });
}
