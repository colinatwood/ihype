import type { Session } from 'next-auth';

export function isAdminRole(role: string | null | undefined) {
  return role === 'ADMIN';
}

export function isAdminSession(session: Session | null | undefined) {
  return isAdminRole(session?.user?.role);
}

export function canManageOwnedResource(
  session: Session | null | undefined,
  ownerId: string | null | undefined
) {
  if (!session?.user?.id || !ownerId) {
    return false;
  }

  return isAdminSession(session) || session.user.id === ownerId;
}
