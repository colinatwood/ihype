import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ids = (new URL(request.url).searchParams.get('ids') ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (!ids.length) {
    return NextResponse.json({ counts: {} });
  }

  const groups = await db.seed.groupBy({
    by: ['mediaId'],
    where: { mediaId: { in: ids }, action: 'hype' },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const g of groups) {
    counts[g.mediaId] = g._count._all;
  }

  return NextResponse.json({ counts }, { headers: { 'Cache-Control': 'no-store' } });
}
