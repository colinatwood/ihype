import { NextRequest, NextResponse } from 'next/server';
import { trackRequest } from '@/lib/analytics';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();
  const durationMs = Date.now() - start;

  trackRequest(request.nextUrl.pathname, response.status, durationMs);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};

