# Runbook — Annual PCI DSS SAQ A Attestation

**Owner:** admin@ihype.org · **Cadence:** annual (do it the same week as the January restore drill) · **Time needed:** ~1 hour

## Why SAQ A applies
iHYPE never receives, stores, or transmits cardholder data. Card entry happens exclusively inside Stripe.js iframes served from `js.stripe.com`; the server sees only opaque tokens (`pm_…`, `pi_…`, `cus_…`), which the privacy export additionally refuses to emit (`src/app/api/privacy/export/route.ts`). Payouts go through Stripe Connect Express — Stripe holds all KYC/bank data. That is the SAQ A profile: card-not-present, all payment processing fully outsourced to a PCI DSS validated provider.

## Annual checklist
1. **Confirm the integration still qualifies for SAQ A** — grep the codebase for any handling of PANs before attesting:
   - card fields must only ever be Stripe Elements (`js.stripe.com` in CSP `script-src`/`frame-src`, `api.stripe.com` in `connect-src` — `src/middleware.ts`);
   - no request logging of payment bodies; Sentry `sendDefaultPii` stays unset;
   - `sk_test_` still blocked in production (`src/lib/payments.ts` + `scripts/lint-source.mjs` enforce this).
2. **Complete the SAQ in Stripe:** Dashboard → Settings → Compliance (Stripe surfaces the SAQ A questionnaire and records the attestation). Answer for ihype.org only.
3. **Verify TLS posture** (SAQ A requirement 4): HSTS preload + forced HTTPS redirect are covered by `next.config.mjs` / `src/middleware.ts`; confirm the cert at ihype.org is valid and auto-renewing (Cloudflare-managed).
4. **Access review** (requirement 8/9 lite): list who can reach the Stripe dashboard, Cloudflare, Supabase, and GitHub; remove anyone who no longer needs it. One operator today — the review is confirming that's still true.
5. **File the evidence:** save the attestation PDF from Stripe and note the completion date in `SECURITY_COMPLIANCE.md` (gap G-7 row).

## Standing rules that keep SAQ A valid
- Never add a card input outside Stripe Elements; never proxy `api.stripe.com` through our own routes with card data in the body.
- Never log request bodies on payment routes.
- If a future feature would touch PANs directly (it shouldn't), the SAQ level changes — stop and reassess before building.
