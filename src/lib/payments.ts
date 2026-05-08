export function isPaymentProcessingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function assertPaymentProcessingConfigured() {
  if (!isPaymentProcessingConfigured()) {
    throw new Error('Ticket payment capture requires STRIPE_SECRET_KEY in production environment variables.');
  }
}
