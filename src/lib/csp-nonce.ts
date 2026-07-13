import { headers } from 'next/headers';

// proxy.ts stamps a fresh per-request nonce onto the request headers
// (see requestHeaders.set('x-nonce', ...)) so the strict CSP's script-src
// can allow specific inline/external <script> tags without 'unsafe-inline'.
// Any Server Component that renders a <script> tag must read this and pass
// it as that tag's nonce attribute, or the browser silently blocks it.
export async function getCspNonce(): Promise<string | undefined> {
  const headerList = await headers();
  return headerList.get('x-nonce') ?? undefined;
}
