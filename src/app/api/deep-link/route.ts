import { NextRequest, NextResponse } from 'next/server';

const SAFE_PATH_RE = /^\/[a-zA-Z0-9\-._~:@!$&'()*+,;=%/?]*$/;

function htmlEncode(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('path') ?? '/';
  const path = SAFE_PATH_RE.test(rawPath) ? rawPath : '/';
  const appUrl = `ihype://${path.replace(/^\//, '')}`;
  const webUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ihype.org'}${path}`;
  const ua = request.headers.get('user-agent') ?? '';
  const isMobile = /iPhone|iPad|Android/i.test(ua);
  if (isMobile) {
    const encodedWebUrl = htmlEncode(webUrl);
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="1;url=${encodedWebUrl}"><script>window.location='${appUrl}';setTimeout(()=>{window.location='${appUrl.replace(/'/g, "\\'")}'},1000)</script></head><body></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  return NextResponse.redirect(webUrl);
}
