import { db } from '@/lib/db';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function consumeRateLimit(key: string, { limit, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = new Date(now + windowMs);
  const existing = await db.rateLimitBucket.findUnique({ where: { key } });

  if (!existing || existing.resetAt.getTime() <= now) {
    await db.rateLimitBucket.upsert({
      where: { key },
      create: {
        key,
        count: 1,
        resetAt
      },
      update: {
      count: 1,
        resetAt
      }
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000)
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt.getTime() - now) / 1000))
    };
  }

  const updated = await db.rateLimitBucket.update({
    where: { key },
    data: {
      count: {
        increment: 1
      }
    }
  });

  return {
    allowed: true,
    remaining: Math.max(0, limit - updated.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt.getTime() - now) / 1000))
  };
}
