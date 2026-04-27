import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendLoginOtpEmail } from '@/lib/mailer';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';

const schema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1)
});

function generateOtp() {
  const bytes = randomBytes(4);
  return String(bytes.readUInt32BE(0) % 1_000_000).padStart(6, '0');
}

export async function POST(request: Request) {
  const clientAddress = readClientAddress(request);
  const rateLimit = consumeRateLimit(`otp-request:${clientAddress}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many code requests. Wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const identifier = body.identifier.trim().toLowerCase();

  const user = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] }
  });

  if (!user?.passwordHash) {
    // Constant-time delay to prevent user enumeration
    await new Promise(r => setTimeout(r, 400));
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const passwordValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!passwordValid) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  // Delete any existing unused challenges for this user to avoid DB clutter
  await db.mfaChallenge.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } }
  });

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const challengeToken = randomBytes(32).toString('hex');

  await db.mfaChallenge.create({
    data: {
      token: challengeToken,
      userId: user.id,
      secretCiphertext: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  await sendLoginOtpEmail({ email: user.email, name: user.name, otp });

  return NextResponse.json({ challengeId: challengeToken, email: user.email });
}
