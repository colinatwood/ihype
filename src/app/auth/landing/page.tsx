import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDefaultLandingPathForUser } from '@/lib/account-routing';
import type { DiscoverModuleId } from '@/lib/discover-modules';

const requestedModules = new Set<DiscoverModuleId>([
  'tool-hub',
  'my-page',
  'events',
  'recommendation-engine',
  'ticket-hub',
  'tour-creator',
  'event-creator',
  'show-creator'
]);

function resolveRequestedModule(module: string | string[] | undefined): DiscoverModuleId | undefined {
  return typeof module === 'string' && requestedModules.has(module as DiscoverModuleId)
    ? (module as DiscoverModuleId)
    : undefined;
}

export default async function AuthLandingPage({
  searchParams
}: {
  searchParams?: Promise<{ module?: string | string[] }>;
}) {
  const session = await auth();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  if (!session?.user?.id) {
    redirect('/login');
  }

  redirect(
    await getDefaultLandingPathForUser({
      userId: session.user.id,
      role: session.user.role,
      module: resolveRequestedModule(resolvedSearchParams.module)
    })
  );
}
