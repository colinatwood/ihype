// Cloudflare Durable Object for atomic rate limiting.
// One DO instance per rate-limit key — all reads and writes are serialised
// within the instance, so there is no read-increment-write race condition.
//
// POST /check  { limit: number, windowMs: number }
//   → { allowed: boolean, remaining: number, retryAfterSeconds: number }
//
// Uses Web APIs only (no Node.js built-ins) so it can run in the CF Workers
// runtime.

type DOState = { storage: { get<T>(key: string): Promise<T | undefined>; put(key: string, value: unknown): Promise<void> } };

type StoredRecord = {
  count: number;
  resetAt: number; // Unix ms
};

export class RateLimiterDO {
  private state: DOState;

  constructor(state: DOState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== 'POST' || url.pathname !== '/check') {
      return new Response('Not found', { status: 404 });
    }

    const body = await request.json() as { limit: number; windowMs: number };
    const { limit, windowMs } = body;

    const now = Date.now();
    const stored = await this.state.storage.get('r') as StoredRecord | undefined;

    let count: number;
    let resetAt: number;

    if (!stored || stored.resetAt <= now) {
      // Start a fresh window.
      count = 1;
      resetAt = now + windowMs;
    } else {
      count = stored.count + 1;
      resetAt = stored.resetAt;
    }

    await this.state.storage.put('r', { count, resetAt } as StoredRecord);

    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return new Response(
      JSON.stringify({ allowed, remaining, retryAfterSeconds }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
