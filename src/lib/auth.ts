import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

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
        password: { label: 'Password', type: 'password' },
        otp: { label: 'Authentication code', type: 'text' },
        challengeToken: { label: 'Challenge token', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.otp || !credentials?.challengeToken) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: String(credentials.email).toLowerCase() }
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isValid) return null;

        const challenge = await db.mfaChallenge.findUnique({
          where: { token: String(credentials.challengeToken) }
        });

        if (!challenge || challenge.userId !== user.id || challenge.expiresAt < new Date()) {
          return null;
        }

        const encryptedSecret = user.mfaSecret ?? challenge.secretCiphertext;
        if (!encryptedSecret) {
          return null;
        }

        const { decryptMfaSecret, verifyTotpCode } = await import('@/lib/mfa');
        let secret: string;
        try {
          secret = await decryptMfaSecret(encryptedSecret);
        } catch {
          return null;
        }

        const isCodeValid = await verifyTotpCode(String(credentials.otp), secret);
        if (!isCodeValid) return null;

        await db.$transaction([
          db.mfaChallenge.deleteMany({
            where: {
              OR: [{ token: challenge.token }, { userId: user.id }, { expiresAt: { lt: new Date() } }]
            }
          }),
          ...(user.mfaSecret
            ? []
            : [
                db.user.update({
                  where: { id: user.id },
                  data: {
                    mfaSecret: encryptedSecret,
                    mfaEnabledAt: new Date()
                  }
                })
              ])
        ]);

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
