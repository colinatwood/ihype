import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CollabBoardClient } from '@/components/CollabBoardClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collab Board · iHYPE',
  description: 'Find bandmates, venues, and collaborators in the iHYPE community.',
  robots: { index: false, follow: false },
};

export default async function CollabBoardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/collab-board');
  }

  return <CollabBoardClient />;
}
