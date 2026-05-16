import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordAuditEvent } from '@/lib/audit';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';

const schema = z.object({
  event: z.enum([
    'view_signup',
    'select_role',
    'enter_email',
    'enter_phone',
    'submit_register',
    'register_success',
    'register_error',
    'passkey_prompt',
    'passkey_register_start',
    'passkey_register_success',
    'passkey_register_error',
    'passkey_register_skip',
    'passkey_auth_start',
    'passkey_auth_success',
    'passkey_auth_error',
    'otp_request',
    'otp_verify_start',
    'otp_verify_success',
    'otp_verify_error',
    'login_success',
    'login_error',
  ]),
  role: z.enum(['FAN', 'ARTIST', 'DJ', 'VENUE']).optional(),
  method: z.enum(['email', 'passkey']).optional(),
  step: z.string().trim().max(80).optional(),
  reason: z.string().trim().max(240).optional(),
  browser: z.string().trim().max(80).optional(),
  platform: z.string().trim().max(80).optional(),
  webauthn: z.string().trim().max(40).optional(),
  errorName: z.string().trim().max(80).optional(),
  variant: z.string().trim().max(40).optional(),
  viewport: z.string().trim().max(40).optional()
});

export async function POST(request: Request) {
  const clientAddress = readClientAddress(request);
  const rateLimit = await consumeRateLimit(`signup-funnel:${clientAddress}`, {
    limit: 60,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: true });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: true });
  }

  await recordAuditEvent({
    action: `signup_funnel:${body.event}`,
    entityType: 'signup_funnel',
    ipAddress: clientAddress,
    metadata: {
      role: body.role ?? null,
      method: body.method ?? null,
      step: body.step ?? null,
      reason: body.reason ?? null,
      browser: body.browser ?? null,
      platform: body.platform ?? null,
      webauthn: body.webauthn ?? null,
      errorName: body.errorName ?? null,
      variant: body.variant ?? null,
      viewport: body.viewport ?? null
    }
  });

  return NextResponse.json({ ok: true });
}
