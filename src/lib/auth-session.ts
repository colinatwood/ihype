import { encode } from 'next-auth/jwt';

export const AUTH_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

type AuthSessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  emailVerified?: Date | string | null;
};

export function getAuthSessionCookieName() {
  return process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';
}

function getEmailVerifiedIso(emailVerified: AuthSessionUser['emailVerified']) {
  if (!emailVerified) return null;
  return emailVerified instanceof Date ? emailVerified.toISOString() : emailVerified;
}

export async function buildAuthSessionCookie(user: AuthSessionUser) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const cookieName = getAuthSessionCookieName();
  const now = Math.floor(Date.now() / 1000);
  const value = await encode({
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: user.image,
      role: user.role,
      emailVerified: getEmailVerifiedIso(user.emailVerified),
      iat: now,
      exp: now + AUTH_SESSION_MAX_AGE_SECONDS,
      jti: crypto.randomUUID()
    },
    secret,
    salt: cookieName
  });

  return {
    name: cookieName,
    value,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS
  };
}
