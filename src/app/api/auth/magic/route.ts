import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildAuthSessionCookie } from '@/lib/auth-session';
import { checkAndRecordLogin } from '@/lib/login-security';
import { resolvePostAuthRedirect } from '@/lib/auth-redirects';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');

  if (!token || typeof token !== 'string') {
    return NextResponse.redirect(new URL('/login?error=invalid_magic_link', request.url));
  }

  let record: { id: string; used: boolean; expiresAt: Date; userId: string } | null = null;
  try {
    record = await db.magicLinkToken.findUnique({ where: { token } });
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 120) : String(err).slice(0, 120);
    console.error('[magic-link] token lookup failed:', err);
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'ml_db_error');
    url.searchParams.set('detail', msg);
    return NextResponse.redirect(url);
  }

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login?error=expired_magic_link', request.url));
  }

  let user: { id: string; name: string | null; email: string | null; image: string | null; role: string; emailVerified: Date | null; userSecurityVersion: number; lastLoginCountry: string | null } | null = null;
  try {
    user = await db.user.findUnique({
      where: { id: record.userId },
      select: { id: true, name: true, email: true, image: true, role: true, emailVerified: true, userSecurityVersion: true, lastLoginCountry: true },
    });
  } catch (err) {
    console.error('[magic-link] user lookup failed:', err);
    return NextResponse.redirect(new URL('/login?error=ml_db_error', request.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=expired_magic_link', request.url));
  }

  // Clicking the link proves ownership of the inbox, same as the old OTP flow.
  if (!user.emailVerified) {
    const emailVerified = new Date();
    user = { ...user, emailVerified };
    db.user.update({ where: { id: user.id }, data: { emailVerified } }).catch((e: unknown) => {
      console.error('[magic-link] emailVerified update failed', e);
    });
  }

  try {
    await db.magicLinkToken.update({ where: { id: record.id }, data: { used: true } });
  } catch (err) {
    console.error('[magic-link] Token mark-used failed:', err);
    // non-fatal — proceed with sign-in
  }

  if (!process.env.AUTH_SECRET) {
    console.error('[magic-link] AUTH_SECRET is not set');
    return NextResponse.redirect(new URL('/login?error=ml_no_secret', request.url));
  }

  const sessionCookie = await buildAuthSessionCookie(user);
  if (!sessionCookie) {
    console.error('[magic-link] buildAuthSessionCookie returned null for user', user.id, 'securityVersion:', user.userSecurityVersion);
    return NextResponse.redirect(new URL('/login?error=ml_cookie_error', request.url));
  }

  void checkAndRecordLogin(user, request);

  const rawCallback = searchParams.get('callbackUrl');
  const defaultDest = user.role === 'ADMIN' ? '/admin' : undefined;
  const dest = resolvePostAuthRedirect(rawCallback ?? defaultDest);

  const response = NextResponse.redirect(new URL(dest, request.url));
  response.cookies.set(sessionCookie);
  return response;
}
