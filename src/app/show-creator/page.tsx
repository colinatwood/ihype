import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ShowCreatorClient } from './ShowCreatorClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Show Creator · iHYPE' };

export default async function ShowCreatorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/show-creator');

  const profiles = await db.profile.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, type: true, slug: true }
  });

  return <ShowCreatorClient profiles={profiles} />;
}
