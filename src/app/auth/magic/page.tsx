import { redirect } from 'next/navigation';
import { encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE = 12 * 60 * 60;

export default async function MagicLinkPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== 'string') {
    redirect('/login?error=invalid_magic_link');
  }

  const record = await db.magicLinkToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true, emailVerified: true } } }
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    redirect('/login?error=expired_magic_link');
  }

  await db.magicLinkToken.update({ where: { id: record.id }, data: { used: true } });

  const secret = process.env.AUTH_SECRET;
  if (!secret) redirect('/login?error=server_error');

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token';
  const now = Math.floor(Date.now() / 1000);
  const user = record.user;

  const sessionToken = await encode({
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: user.image,
      role: user.role,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      iat: now,
      exp: now + SESSION_MAX_AGE,
      jti: crypto.randomUUID()
    },
    secret,
    salt: cookieName
  });

  const jar = await cookies();
  jar.set({
    name: cookieName,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction,
    maxAge: SESSION_MAX_AGE
  });

  redirect('/home');
}
