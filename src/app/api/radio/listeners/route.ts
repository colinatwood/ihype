import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const liveShows = await db.show.findMany({
      where: { isRadioShow: true, status: 'LIVE' },
      select: { id: true },
    });
    const total = liveShows.length === 0 ? 0 : await db.showRsvp.count({
      where: { showId: { in: liveShows.map(s => s.id) } },
    });
    return NextResponse.json({ total });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
