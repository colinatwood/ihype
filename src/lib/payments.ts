function isExplicitlyEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === 'true';
}

export function isPaymentProcessingConfigured() {
  return getPaymentProcessingReadiness().ready;
}

export function getPaymentProcessingReadiness() {
  const blockers: string[] = [];
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!isExplicitlyEnabled(process.env.FEATURE_ENABLE_TICKET_PAYMENTS)) {
    blockers.push('Set FEATURE_ENABLE_TICKET_PAYMENTS=true only when paid ticketing is approved for launch.');
  }

  if (!stripeSecretKey?.startsWith('sk_')) {
    blockers.push('Set STRIPE_SECRET_KEY to a valid sk_ secret.');
  } else if (process.env.NODE_ENV === 'production' && stripeSecretKey.startsWith('sk_test_')) {
    blockers.push('Production paid ticketing requires a live Stripe secret key, not sk_test_.');
  }

  if (!stripeWebhookSecret?.startsWith('whsec_')) {
    blockers.push('Set STRIPE_WEBHOOK_SECRET so ticket/payment webhooks can be verified.');
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function assertPaymentProcessingConfigured() {
  if (!isPaymentProcessingConfigured()) {
    throw new Error('Paid ticketing is currently unavailable.');
  }
}
