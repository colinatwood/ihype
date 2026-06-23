#!/usr/bin/env node
/**
 * Validates that all required secrets are present before a beta launch.
 *
 * Usage (local .env):
 *   node -r dotenv/config scripts/beta-launch-check.mjs
 *
 * Usage (Cloudflare Workers secrets via wrangler):
 *   wrangler secret list  (then verify manually)
 *
 * Exit code 0 = all required secrets present.
 * Exit code 1 = one or more required secrets missing.
 */

const REQUIRED = [
  { key: 'AUTH_SECRET',            hint: 'Generate with: openssl rand -hex 32' },
  { key: 'DATABASE_URL',           hint: 'Supabase session pooler URL' },
  { key: 'RESEND_API_KEY',         hint: 'Required for OTP login and ticket emails' },
  { key: 'CRON_SECRET',            hint: 'Protects /api/cron/* routes; generate with: openssl rand -hex 32' },
  { key: 'STRIPE_SECRET_KEY',      hint: 'Required for ticketing and payouts (use sk_live_* in production)' },
  { key: 'STRIPE_WEBHOOK_SECRET',  hint: 'From Stripe Dashboard → Webhooks → signing secret' },
  { key: 'VAPID_PUBLIC_KEY',       hint: 'Generate with: node scripts/generate-vapid-keys.mjs' },
  { key: 'VAPID_PRIVATE_KEY',      hint: 'Generate with: node scripts/generate-vapid-keys.mjs' },
  { key: 'VAPID_SUBJECT',          hint: 'e.g. mailto:hello@ihype.org' },
  { key: 'BETA_INVITE_CODES',      hint: 'Comma-separated codes, e.g. IHYPE,HYPE2026' },
];

const OPTIONAL = [
  { key: 'NEXT_PUBLIC_SENTRY_DSN', hint: 'Sentry error monitoring' },
  { key: 'OPENAI_API_KEY',         hint: 'AI discovery features' },
  { key: 'MUX_TOKEN_ID',           hint: 'Video streaming' },
  { key: 'MUX_TOKEN_SECRET',       hint: 'Video streaming' },
];

let failed = false;

console.log('\n=== iHYPE Beta Launch — Secret Check ===\n');

for (const { key, hint } of REQUIRED) {
  const val = process.env[key];
  if (!val || val.trim() === '') {
    console.error(`  MISSING  ${key}`);
    console.error(`           ${hint}\n`);
    failed = true;
  } else {
    console.log(`  OK       ${key}`);
  }
}

console.log('\n--- Optional ---\n');

for (const { key, hint } of OPTIONAL) {
  const val = process.env[key];
  if (!val || val.trim() === '') {
    console.log(`  MISSING  ${key}  (optional: ${hint})`);
  } else {
    console.log(`  OK       ${key}`);
  }
}

if (failed) {
  console.error('\nFAILED: one or more required secrets are missing. See above.\n');
  process.exit(1);
} else {
  console.log('\nPASSED: all required secrets are present.\n');
}
