import dynamicImport from 'next/dynamic';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { MOCK_DATA } from '@/lib/workbench-mock';
import type { WorkbenchData } from '@/components/WorkbenchShellV2';
import type { Metadata } from 'next';
import { getWorkbenchData as fetchWorkbenchData } from '@/lib/getWorkbenchData';

// Loaded via next/dynamic (rather than a static import) so each shell is its
// own chunk — only the one actually rendered per-request is referenced in
// the RSC payload and downloaded by the client. The workbench shells are
// large client components; statically importing both nearly doubled this
// route's JS payload even though only one is ever shown.
const WorkbenchShell = dynamicImport(() => import('@/components/WorkbenchShellV2').then((m) => m.WorkbenchShell));
const WorkbenchMobile = dynamicImport(() => import('@/components/WorkbenchMobile').then((m) => m.WorkbenchMobile));

// Mirrors the .wb-desktop / .wb-mobile breakpoint previously used in CSS.
const MOBILE_USER_AGENT = /Android|iPhone|iPod|Mobile|Windows Phone/i;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'iHYPE Workbench',
    description: 'Your music command center. Discover new artists, manage shows, track payouts. 45/45/10 — artist, venue, referrer — every time.',
    openGraph: {
      title: 'iHYPE Workbench',
      description: 'Discover new artists, manage shows, track payouts.',
      siteName: 'iHYPE',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'iHYPE Workbench',
      description: 'Your music command center.',
    },
    robots: {
      index: false, // workbench is authenticated — don't index
      follow: false,
    },
  };
}

async function getWorkbenchData(): Promise<WorkbenchData> {
  const session = await auth();
  if (!session?.user?.id) return MOCK_DATA;
  return await fetchWorkbenchData(session.user.id);
}

export default async function HomePage() {
  const [wbData, headerList] = await Promise.all([getWorkbenchData(), headers()]);
  const isMobileUserAgent = MOBILE_USER_AGENT.test(headerList.get('user-agent') ?? '');

  return isMobileUserAgent ? <WorkbenchMobile data={wbData} /> : <WorkbenchShell data={wbData} />;
}
