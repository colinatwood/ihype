import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';
import { readClientAddress } from '@/lib/request-meta';
import { areDemoLoginsEnabled, isDemoIdentifier, isDemoUser } from '@/lib/runtime-flags';
import { authConfig } from '@/lib/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        identifier: { label: 'Email or username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, request) {
        if (!credentials?.identifier || !credentials?.password) {
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

        const identifier = String(credentials.identifier).trim().toLowerCase();

        if (!areDemoLoginsEnabled() && isDemoIdentifier(identifier)) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          return null;
        }

        const user = await db.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }]
          }
        });

        if (!user?.passwordHash) return null;
        if (!areDemoLoginsEnabled() && isDemoUser(user)) return null;

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
  ]
});
