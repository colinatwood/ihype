import { WorkbenchShell } from '@/components/WorkbenchShellV2';
import { WorkbenchMobile } from '@/components/WorkbenchMobile';
import { auth } from '@/lib/auth';
import { MOCK_DATA } from '@/lib/workbench-mock';
import type { WorkbenchData } from '@/components/WorkbenchShellV2';
import type { Metadata } from 'next';

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
  try {
    const session = await auth();
    if (!session?.user?.id) return MOCK_DATA;

    // Fetch from our own API route (keeps all Prisma logic in one place)
    // Use relative URL with headers forwarded
    const { headers } = await import('next/headers');
    const hdrs = await headers();
    const host = hdrs.get('host') ?? 'localhost:3000';
    const proto = host.startsWith('localhost') ? 'http' : 'https';
    const res = await fetch(`${proto}://${host}/api/workbench-data`, {
      headers: { cookie: hdrs.get('cookie') ?? '' },
      cache: 'no-store',
    });
    if (!res.ok) return MOCK_DATA;
    return res.json();
  } catch {
    return MOCK_DATA;
  }
}

export default async function HomePage() {
  const wbData = await getWorkbenchData();

  return (
    <>
      {/* Desktop/tablet: ≥640px */}
      <div className="wb-desktop">
        <WorkbenchShell data={wbData} />
      </div>
      {/* Mobile: <640px */}
      <div className="wb-mobile">
        <WorkbenchMobile data={wbData} />
      </div>
      <style>{`
        .wb-desktop { display: block; }
        .wb-mobile  { display: none;  }
        @media (max-width: 639px) {
          .wb-desktop { display: none;  }
          .wb-mobile  { display: block; }
        }
      `}</style>
    </>
  );
}
