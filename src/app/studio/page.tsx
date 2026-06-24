import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { StudioDashboard } from '@/components/StudioDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Studio · iHYPE',
  description: 'Manage shows, track demand, and monitor earnings.',
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/studio');
  }
  return <StudioDashboard />;
}
