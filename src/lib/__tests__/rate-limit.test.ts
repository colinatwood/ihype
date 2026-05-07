import { describe, it, expect, beforeEach } from 'vitest';
import { consumeRateLimit } from '../rate-limit';

// Clear the in-process store between tests by consuming under a unique key prefix per test
let testId = 0;
function key(suffix = '') {
  return `test-${testId}-${suffix}`;
}

beforeEach(() => {
  testId++;
});

describe('consumeRateLimit', () => {
  it('allows the first request', () => {
    const result = consumeRateLimit(key(), { limit: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
  });

  it('decrements remaining on each allowed request', () => {
    const k = key();
    const opts = { limit: 3, windowMs: 60_000 };
    expect(consumeRateLimit(k, opts).remaining).toBe(2);
    expect(consumeRateLimit(k, opts).remaining).toBe(1);
    expect(consumeRateLimit(k, opts).remaining).toBe(0);
  });

  it('blocks the request exactly at the limit', () => {
    const k = key();
    const opts = { limit: 2, windowMs: 60_000 };
    consumeRateLimit(k, opts); // 1
    consumeRateLimit(k, opts); // 2 — limit reached
    const result = consumeRateLimit(k, opts); // 3 — should be blocked
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns retryAfterSeconds > 0 when blocked', () => {
    const k = key();
    const opts = { limit: 1, windowMs: 30_000 };
    consumeRateLimit(k, opts); // allowed
    const blocked = consumeRateLimit(k, opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets after the window expires', async () => {
    const k = key();
    const opts = { limit: 1, windowMs: 50 }; // 50ms window
    consumeRateLimit(k, opts); // consume the only slot
    const blocked = consumeRateLimit(k, opts);
    expect(blocked.allowed).toBe(false);

    await new Promise((r) => setTimeout(r, 60)); // wait for window to expire

    const reset = consumeRateLimit(k, opts);
    expect(reset.allowed).toBe(true);
  });

  it('independent keys do not interfere', () => {
    const opts = { limit: 1, windowMs: 60_000 };
    consumeRateLimit(key('a'), opts); // exhaust key-a
    const result = consumeRateLimit(key('b'), opts); // key-b should be fresh
    expect(result.allowed).toBe(true);
  });

  it('remaining is never negative', () => {
    const k = key();
    const opts = { limit: 1, windowMs: 60_000 };
    consumeRateLimit(k, opts);
    const result = consumeRateLimit(k, opts);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });
});
