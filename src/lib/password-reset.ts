import { createHash, randomInt } from 'crypto';
import { env } from '@/lib/env';

export const PASSWORD_RESET_CODE_TTL_MINUTES = 5;
export const PASSWORD_RESET_CODE_TTL_MS = PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000;
export const PASSWORD_RESET_MAX_ATTEMPTS = 5;

export function normalizeEmailAddress(email: string) {
  return email.trim().toLowerCase();
}

export function createPasswordResetCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashPasswordResetCode(email: string, code: string) {
  return createHash('sha256')
    .update(`${env.AUTH_SECRET}:${normalizeEmailAddress(email)}:${code}`)
    .digest('hex');
}

export function createPasswordResetExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS);
}

export function isPasswordResetExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now();
}
