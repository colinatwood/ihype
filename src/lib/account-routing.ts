import { ProfileType } from '@prisma/client';
import { db } from '@/lib/db';

export function getProfilePathForType(type: ProfileType, slug: string) {
  if (type === 'DJ') return `/promoters/${slug}`;
  if (type === 'VENUE') return `/venues/${slug}`;
  if (type === 'LISTENER') return `/fans/${slug}`;
  return `/artists/${slug}`;
}

function getPreferredProfileTypeForRole(role: string | null | undefined): ProfileType | null {
  if (role === 'ARTIST') return 'ARTIST';
  if (role === 'DJ') return 'DJ';
  if (role === 'VENUE') return 'VENUE';
  if (role === 'FAN') return 'LISTENER';
  return null;
}

export async function getDefaultLandingPathForUser({
  userId,
  role
}: {
  userId: string;
  role: string | null | undefined;
}) {
  if (role === 'ADMIN') {
    return '/dashboard';
  }

  const preferredProfileType = getPreferredProfileTypeForRole(role);

  if (preferredProfileType) {
    const preferredProfile = await db.profile.findFirst({
      where: {
        ownerId: userId,
        type: preferredProfileType
      },
      select: {
        slug: true,
        type: true
      },
      orderBy: { createdAt: 'asc' }
    });

    if (preferredProfile) {
      return getProfilePathForType(preferredProfile.type, preferredProfile.slug);
    }
  }

  const fallbackProfile = await db.profile.findFirst({
    where: { ownerId: userId },
    select: {
      slug: true,
      type: true
    },
    orderBy: { createdAt: 'asc' }
  });

  if (fallbackProfile) {
    return getProfilePathForType(fallbackProfile.type, fallbackProfile.slug);
  }

  return '/dashboard';
}
