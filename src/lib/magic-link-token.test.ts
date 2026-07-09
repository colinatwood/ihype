import { describe, expect, it } from 'vitest';
import { createMagicLinkToken, hashMagicLinkToken } from '@/lib/magic-link-token';

describe('magic-link tokens', () => {
  it('stores a one-way hash instead of the bearer token', () => {
    const created = createMagicLinkToken();

    expect(created.token).toMatch(/^[a-f0-9]{64}$/);
    expect(created.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(created.tokenHash).not.toBe(created.token);
    expect(hashMagicLinkToken(created.token)).toBe(created.tokenHash);
  });

  it('produces different tokens and hashes for separate requests', () => {
    const first = createMagicLinkToken();
    const second = createMagicLinkToken();

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });
});
