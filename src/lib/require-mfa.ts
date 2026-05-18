import { db } from '@/lib/db';

export async function userHasMfa(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { mfaEnabledAt: true } });
  return user?.mfaEnabledAt != null;
}
