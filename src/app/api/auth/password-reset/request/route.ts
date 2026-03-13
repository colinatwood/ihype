import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, withDbRetry } from '@/lib/db';
import { isPasswordResetEmailConfigured, sendPasswordResetPasscodeEmail } from '@/lib/mailer';
import {
  createPasswordResetCode,
  createPasswordResetExpiry,
  normalizeEmailAddress,
  PASSWORD_RESET_CODE_TTL_MINUTES,
  hashPasswordResetCode
} from '@/lib/password-reset';

const requestSchema = z.object({
  email: z.string().email()
});

const GENERIC_SUCCESS_MESSAGE =
  'If that email is registered, we sent a temporary passcode with a 5 minute reset window.';

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const email = normalizeEmailAddress(body.email);

    if (process.env.NODE_ENV === 'production' && !isPasswordResetEmailConfigured()) {
      return NextResponse.json(
        { error: 'Password reset email delivery is not configured yet.' },
        { status: 503 }
      );
    }

    const user = await withDbRetry(() =>
      db.user.findUnique({
        where: { email }
      })
    );

    if (!user?.passwordHash) {
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    const code = createPasswordResetCode();
    const expiresAt = createPasswordResetExpiry();
    const codeHash = hashPasswordResetCode(email, code);

    await withDbRetry(() =>
      db.passwordResetCode.deleteMany({
        where: {
          email
        }
      })
    );

    const resetCode = await withDbRetry(() =>
      db.passwordResetCode.create({
        data: {
          email,
          codeHash,
          expiresAt,
          userId: user.id
        }
      })
    );

    try {
      const delivery = await sendPasswordResetPasscodeEmail({
        email,
        code,
        name: user.name,
        expiresInMinutes: PASSWORD_RESET_CODE_TTL_MINUTES
      });

      return NextResponse.json({
        message:
          delivery.mode === 'log'
            ? `${GENERIC_SUCCESS_MESSAGE} Development mode is logging the code to the server console.`
            : GENERIC_SUCCESS_MESSAGE
      });
    } catch (error) {
      console.error('Password reset email delivery failed', error);

      await withDbRetry(() =>
        db.passwordResetCode.delete({
          where: {
            id: resetCode.id
          }
        })
      );

      return NextResponse.json(
        { error: 'Unable to send a reset passcode right now. Please try again in a moment.' },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Invalid password reset request.' }, { status: 400 });
  }
}
