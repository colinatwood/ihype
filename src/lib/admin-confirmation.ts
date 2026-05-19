import { kvGet, kvPut } from '@/lib/kv';

export async function markAdminReauth(userId: string): Promise<void> {
  await kvPut('admin_reauth:' + userId, Date.now(), { ex: 5 * 60 });
}

export async function hasRecentAdminReauth(userId: string): Promise<boolean> {
  return (await kvGet('admin_reauth:' + userId)) !== null;
}
