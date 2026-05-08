import { NextResponse } from 'next/server';
import { getHealthSnapshot } from '@/lib/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await getHealthSnapshot();

  return NextResponse.json(snapshot, {
    status: snapshot.status === 'ok' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
