// Upgrade checklist for next-auth beta bumps:
//   1. Read the release notes for the target version.
//   2. Check NextAuthConfig changes, especially cookie, JWT, and callback shapes.
//   3. Verify Prisma adapter parity.
//   4. Run the OTP, magic-link, passkey, and session persistence tests.
//   5. Update the pinned dependency and override together.
//
// Edge-safe: this file is imported by the proxy and must not import Node-only modules.
import type { NextAuthConfig } from 'next-auth';
import {
  AUTH_SESSION_MAX_AGE_SECONDS,
  AUTH_TRANSIENT_COOKIE_MAX_AGE_SECONDS,
  getAuthSessionCookieName,
  getAuthSessionCookieOptions,
  useSecureAuthCookies,
} from '@/lib/auth-cookie';

const useSecureCookies = useSecureAuthCookies();
const trustHost = process.env.AUTH_TRUST_HOST === 'true' || Boolean(process.env.AUTH_URL);

const transientCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/api/auth',
  secure: useSecureCookies,
  maxAge: AUTH_TRANSIENT_COOKIE_MAX_AGE_SECONDS,
};

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  trustHost,
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: getAuthSessionCookieName(),
      options: getAuthSessionCookieOptions(),
    },
    callbackUrl: {
      options: transientCookieOptions,
    },
    csrfToken: {
      options: transientCookieOptions,
    },
    pkceCodeVerifier: {
      options: {
        ...transientCookieOptions,
        maxAge: undefined,
      },
    },
    state: {
      options: {
        ...transientCookieOptions,
        maxAge: undefined,
      },
    },
    nonce: {
      options: {
        ...transientCookieOptions,
        maxAge: undefined,
      },
    },
    webauthnChallenge: {
      options: {
        ...transientCookieOptions,
        maxAge: undefined,
      },
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  events: {
    async signIn({ user }) {
      void user;
    },
  },
  providers: [],
};
