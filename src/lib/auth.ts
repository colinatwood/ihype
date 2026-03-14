import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';

const useSecureCookies = process.env.NODE_ENV === 'production';
const sessionMaxAgeSeconds = 12 * 60 * 60;
const transientAuthCookieMaxAgeSeconds = 10 * 60;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAgeSeconds,
    updateAge: 60 * 60
  },
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
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const clientAddress = readClientAddress(request);
        const loginRateLimit = consumeRateLimit(`login:${clientAddress}`, {
          limit: 12,
          windowMs: 15 * 60 * 1000
        });

        if (!loginRateLimit.allowed) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: String(credentials.email).toLowerCase() }
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        };
      }
    })
  ],
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
  }
});
