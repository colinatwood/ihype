import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

const legacyRouteRedirects: Record<string, string> = {
  '/ihype-auth.html': '/login',
  '/ihype-login.html': '/login',
  '/ihype-register.html': '/register',
  '/ihype-forgot.html': '/forgot',
  '/ihype-home.html': '/',
  '/ihype-homepage.html': '/',
  '/ihype-promise.html': '/',
  '/ihype-hype-engine.html': '/',
  '/index.html': '/'
};

function isLocalHost(hostname: string) {
  const normalizedHost = hostname.split(':')[0]?.toLowerCase() ?? hostname.toLowerCase();
  return normalizedHost === 'localhost' || normalizedHost === '127.0.0.1' || normalizedHost.endsWith('.localhost');
}

export default auth((request) => {
  const hostHeader = request.headers.get('host') ?? request.nextUrl.hostname;
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (
    process.env.NODE_ENV === 'production' &&
    forwardedProto &&
    forwardedProto !== 'https' &&
    !isLocalHost(hostHeader)
  ) {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl, 308);
  }

  const legacyRedirectTarget = legacyRouteRedirects[request.nextUrl.pathname];
  if (legacyRedirectTarget) {
    return NextResponse.redirect(new URL(legacyRedirectTarget, request.url), 308);
  }

  if (request.nextUrl.pathname.startsWith('/dashboard') && !request.auth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (request.auth && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/landing', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
