import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildOtpAuthUri, encryptMfaSecret, generateMfaSecret, getMfaSetupCopy } from '@/lib/mfa';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await db.user.findUnique({
      where: { email: body.email.toLowerCase() }
    });

    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const setupSecret = user.mfaSecret ? null : generateMfaSecret();

    await db.mfaChallenge.deleteMany({
      where: {
        OR: [{ userId: user.id }, { expiresAt: { lt: new Date() } }]
      }
    });

    const challenge = await db.mfaChallenge.create({
      data: {
        token: randomUUID(),
        userId: user.id,
        secretCiphertext: setupSecret ? await encryptMfaSecret(setupSecret) : null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    return NextResponse.json({
      challengeToken: challenge.token,
      expiresAt: challenge.expiresAt.toISOString(),
      requiresSetup: Boolean(setupSecret),
      secret: setupSecret ? getMfaSetupCopy(setupSecret) : null,
      otpauthUri: setupSecret ? buildOtpAuthUri(user.email, setupSecret) : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid login request' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Could not start MFA login' }, { status: 500 });
  }
}
