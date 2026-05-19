import { kvGet, kvPut, kvIncr } from '@/lib/kv';

export async function isBlocked(ip: string): Promise<boolean> {
  const result = await kvGet<number>('ip-block:' + ip);
  return result !== null;
}

export async function blockIp(ip: string, durationMs: number): Promise<void> {
  await kvPut('ip-block:' + ip, 1, { ex: Math.ceil(durationMs / 1000) });
}

export async function recordLimitHit(ip: string): Promise<void> {
  const result = await kvIncr('limit-hits:' + ip, 3600);
  if (result >= 10) {
    await blockIp(ip, 24 * 60 * 60 * 1000);
  }
}
