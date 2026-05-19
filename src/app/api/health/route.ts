import { NextResponse } from 'next/server';
import { getHealthSnapshot } from '@/lib/health';

export const dynamic = 'force-dynamic';

const CACHE_KEY = new Request('https://ihype.org/api/health');

type CFCacheStorage = { default: { match(req: Request): Promise<Response | undefined>; put(req: Request, resp: Response): Promise<void> } };
const cfCaches = typeof caches !== 'undefined' ? (caches as unknown as CFCacheStorage) : null;

export async function GET() {
  if (cfCaches) {
    try {
      const cached = await cfCaches.default.match(CACHE_KEY);
      if (cached) return cached;
    } catch {
      // Cache API unavailable (local dev) — fall through
    }
  }

  const snapshot = await getHealthSnapshot();
  const status = snapshot.status === 'ok' ? 200 : 503;

  const response = NextResponse.json(snapshot, {
    status,
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' }
  });

  if (cfCaches) {
    try {
      await cfCaches.default.put(CACHE_KEY, response.clone());
    } catch {
      // Cache API unavailable (local dev) — ignore
    }
  }

  return response;
}
