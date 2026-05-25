import { db } from '@/lib/db';
import type { ProfileType } from '@prisma/client/wasm';
import { WORKBENCH_PATH } from '@/lib/auth-redirects';

export function getProfilePathForType(type: ProfileType, slug: string) {
  if (type === 'DJ') return `/promoters/${slug}`;
  if (type === 'VENUE') return `/venues/${slug}`;
  if (type === 'LISTENER') return `/fans/${slug}`;
  return `/artists/${slug}`;
}

export function getDiscoverPathForType(type: ProfileType) {
  if (type === 'DJ') return '/promoters';
  if (type === 'VENUE') return '/venues';
  if (type === 'LISTENER') return '/fans';
  return '/artists';
}

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
