import { NextResponse } from 'next/server';
import { getAuthSessionCookieName } from '@/lib/auth-session';

export async function POST() {
  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getAuthSessionCookieName(),
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction,
    maxAge: 0
  });
  return response;
}
