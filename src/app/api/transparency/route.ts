import { NextResponse } from 'next/server';
import { getTransparencySnapshot } from '@/lib/transparency';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await getTransparencySnapshot();
  return NextResponse.json(snapshot);
}
