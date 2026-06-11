import { db } from '@/lib/db';
import { WORKBENCH_PATH } from '@/lib/auth-redirects';

// The canonical type→path mapping lives in '@/lib/profile-paths' (a
// client-safe module with no DB import) and is re-exported here so server
// code keeps importing it from this module.
export { getProfilePathForType, getDiscoverPathForType } from '@/lib/profile-paths';

export async function getDefaultLandingPathForUser({
  userId
}: {
  userId: string;
}) {
  const hasProfile = await db.profile.findFirst({
    where: { ownerId: userId },
    select: { id: true },
    orderBy: { createdAt: 'asc' }
  });

  return hasProfile ? WORKBENCH_PATH : '/register';
}
