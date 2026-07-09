import { afterEach, describe, expect, it } from 'vitest';
import { getPaymentProcessingReadiness } from '@/lib/payments';

const original = {
  NODE_ENV: process.env.NODE_ENV,
  FEATURE_ENABLE_TICKET_PAYMENTS: process.env.FEATURE_ENABLE_TICKET_PAYMENTS,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};

function setEnvironment(key: keyof typeof original, value: string | undefined) {
  const environment = process.env as unknown as Record<string, string | undefined>;
  if (value === undefined) delete environment[key];
  else environment[key] = value;
}

afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    setEnvironment(key as keyof typeof original, value);
  }
});

describe('payment processing readiness', () => {
  it('stays disabled even when Stripe credentials are present until explicitly launched', () => {
    process.env.FEATURE_ENABLE_TICKET_PAYMENTS = 'false';
    process.env.STRIPE_SECRET_KEY = 'sk_test_example';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_example';

    const readiness = getPaymentProcessingReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.join(' ')).toContain('FEATURE_ENABLE_TICKET_PAYMENTS=true');
  });

  it('requires both Stripe secrets after the launch switch is enabled', () => {
    process.env.FEATURE_ENABLE_TICKET_PAYMENTS = 'true';
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const readiness = getPaymentProcessingReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers).toHaveLength(2);
  });

  it('rejects Stripe test credentials when production ticketing is enabled', () => {
    setEnvironment('NODE_ENV', 'production');
    process.env.FEATURE_ENABLE_TICKET_PAYMENTS = 'true';
    process.env.STRIPE_SECRET_KEY = 'sk_test_example';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_example';

    const readiness = getPaymentProcessingReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.join(' ')).toContain('live Stripe secret key');
  });

  it('is ready only when the switch and live-shaped credentials are configured', () => {
    setEnvironment('NODE_ENV', 'production');
    process.env.FEATURE_ENABLE_TICKET_PAYMENTS = 'true';
    process.env.STRIPE_SECRET_KEY = 'sk_live_example';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_example';

    expect(getPaymentProcessingReadiness()).toEqual({ ready: true, blockers: [] });
  });
});
