import { createHmac } from 'crypto';
import { env } from '@/lib/env';
import { constantTimeEqual } from '@/lib/secret-compare';

// Tokens are HMAC-SHA256(AUTH_SECRET, `${userId}:${PURPOSE}`) so they can be
// verified without a database lookup and keep working while logged out.
// They intentionally never expire — an unsubscribe link in an old email must
// always work.
const PURPOSE = 'email-unsubscribe';

function signUserId(userId: string): string {
  return createHmac('sha256', env.AUTH_SECRET).update(`${userId}:${PURPOSE}`).digest('hex');
}

export function createUnsubscribeToken(userId: string): string {
  return `${userId}.${signUserId(userId)}`;
}

/**
 * Returns the userId embedded in the token when the signature is valid,
 * otherwise null. Uses a constant-time comparison.
 */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
  if (typeof token !== 'string' || token.length === 0) {
    return null;
  }

  const separator = token.lastIndexOf('.');
  if (separator <= 0 || separator === token.length - 1) {
    return null;
  }

  const userId = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  return constantTimeEqual(signature, signUserId(userId)) ? userId : null;
}
