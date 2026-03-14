'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

export type LoginActionState = {
  error: string | null;
  email: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('callbackUrl') ?? '/auth/landing');

  if (!email || !password) {
    return {
      error: 'Enter your email and password.',
      email
    };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo
    });

    return {
      error: null,
      email
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return {
          error: 'Invalid email or password.',
          email
        };
      }

      return {
        error: 'Sign in failed. Please try again.',
        email
      };
    }

    throw error;
  }
}
