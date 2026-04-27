import type { NextAuthConfig } from 'next-auth';

const useSecureCookies = process.env.NODE_ENV === 'production';
const sessionMaxAgeSeconds = 12 * 60 * 60;
const transientAuthCookieMaxAgeSeconds = 10 * 60;

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login'
  },
  useSecureCookies,
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        maxAge: sessionMaxAgeSeconds
      }
    },
    callbackUrl: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/auth',
        secure: useSecureCookies,
        maxAge: transientAuthCookieMaxAgeSeconds
      }
    },
    csrfToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/auth',
        secure: useSecureCookies,
        maxAge: transientAuthCookieMaxAgeSeconds
      }
    },
    pkceCodeVerifier: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/auth',
        secure: useSecureCookies
      }
    },
    state: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/auth',
        secure: useSecureCookies
      }
    },
    nonce: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/auth',
        secure: useSecureCookies
      }
    },
    webauthnChallenge: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/api/auth',
        secure: useSecureCookies
      }
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAgeSeconds,
    updateAge: 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = typeof token.role === 'string' ? token.role : 'FAN';
      }
      return session;
    }
  },
  providers: []
};
