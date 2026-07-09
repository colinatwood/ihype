import { createHash, randomBytes } from 'crypto';

export function hashMagicLinkToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function createMagicLinkToken() {
  const token = randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: hashMagicLinkToken(token),
  };
}
