import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, withDbRetry } from '@/lib/db';
import {
  hashPasswordResetCode,
  isPasswordResetExpired,
  normalizeEmailAddress,
  PASSWORD_RESET_MAX_ATTEMPTS
} from '@/lib/password-reset';

const confirmSchema = z
  .object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export async function POST(request: Request) {
  try {
    const body = confirmSchema.parse(await request.json());
    const email = normalizeEmailAddress(body.email);

    const resetCode = await withDbRetry(() =>
      db.passwordResetCode.findFirst({
        where: {
          email,
          consumedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    );

    if (!resetCode || isPasswordResetExpired(resetCode.expiresAt) || resetCode.attempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'That reset passcode is invalid or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const codeHash = hashPasswordResetCode(email, body.code);

    if (codeHash !== resetCode.codeHash) {
      const nextAttempts = resetCode.attempts + 1;

      await withDbRetry(() =>
        db.passwordResetCode.update({
          where: {
            id: resetCode.id
          },
          data: {
            attempts: {
              increment: 1
            },
            consumedAt: nextAttempts >= PASSWORD_RESET_MAX_ATTEMPTS ? new Date() : undefined
          }
        })
      );

      return NextResponse.json(
        { error: 'That reset passcode is invalid or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    await withDbRetry(() =>
      db.user.update({
        where: {
          id: resetCode.userId
        },
        data: {
          passwordHash
        }
      })
    );

    await withDbRetry(() =>
      db.passwordResetCode.update({
        where: {
          id: resetCode.id
        },
        data: {
          consumedAt: new Date()
        }
      })
    );

    await withDbRetry(() =>
      db.passwordResetCode.deleteMany({
        where: {
          userId: resetCode.userId,
          id: {
            not: resetCode.id
          }
        }
      })
    );

    await withDbRetry(() =>
      db.session.deleteMany({
        where: {
          userId: resetCode.userId
        }
      })
    );

    return NextResponse.json({
      message: 'Password updated. You can sign in with your new password now.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid reset payload.' }, { status: 400 });
    }

    console.error('Password reset confirmation failed', error);
    return NextResponse.json({ error: 'Unable to update your password right now.' }, { status: 500 });
  }
}
