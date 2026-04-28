import { NextResponse } from 'next/server';
import { encode } from '@auth/core/jwt';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';

const schema = z.object({
  challengeId: z.string().min(1),
  otp: z.string().length(6)
});

const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours

export async function POST(request: Request) {
  try {
    const clientAddress = readClientAddress(request);
    const rateLimit = consumeRateLimit(`otp-verify:${clientAddress}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
    }

    let body: z.infer<typeof schema>;
    try {
      body = schema.parse(await request.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const challenge = await db.mfaChallenge.findUnique({
      where: { token: body.challengeId },
      include: { user: true }
    });

    if (!challenge || !challenge.secretCiphertext) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 });
    }

    if (challenge.expiresAt < new Date()) {
      await db.mfaChallenge.delete({ where: { id: challenge.id } });
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(body.otp, challenge.secretCiphertext);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect code.' }, { status: 401 });
    }

    await db.mfaChallenge.delete({ where: { id: challenge.id } });

    const user = challenge.user;
    const isProduction = process.env.NODE_ENV === 'production';

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    const now = Math.floor(Date.now() / 1000);
    const token = await encode({
      token: {
        sub: user.id,
        name: user.name,
        email: user.email,
        picture: user.image,
        role: user.role,
        iat: now,
        exp: now + SESSION_MAX_AGE,
        jti: crypto.randomUUID()
      },
      secret,
      salt: isProduction ? '__Host-authjs.session-token' : 'authjs.session-token'
    });

    const cookieName = isProduction ? '__Host-authjs.session-token' : 'authjs.session-token';
    const cookieAttributes = [
      `${cookieName}=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${SESSION_MAX_AGE}`,
      ...(isProduction ? ['Secure'] : [])
    ].join('; ');

    return NextResponse.json(
      { redirect: '/auth/landing' },
      { headers: { 'Set-Cookie': cookieAttributes } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[otp/signin]', msg);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
