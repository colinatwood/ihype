import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDemoCreatorExclusion } from '@/lib/runtime-flags';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  const { showId } = await params;

  if (!showId) {
    return NextResponse.json({ error: 'Show ID or slug is required.' }, { status: 400 });
  }

  const show = await db.show.findFirst({
    where: {
      OR: [{ slug: showId }, { id: showId }],
      status: { in: ['SCHEDULED', 'LIVE', 'ENDED'] },
      ...getDemoCreatorExclusion()
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      startsAt: true,
      endsAt: true,
      isRadioShow: true,
      isTicketed: true,
      ticketPriceCents: true,
      ticketCapacity: true,
      ticketsSoldCount: true,
      ticketingOpensAt: true,
      bookingLegalNotes: true,
      hypeCount: true,
      tags: true,
      productionPlan: true,
      posterImage: true,
      venuePayoutPercent: true,
      artistPayoutPercent: true,
      promoterPayoutPercent: true,
      venueProfile: { select: { name: true, slug: true, city: true, stateRegion: true, country: true } },
      headlinerProfile: { select: { name: true, slug: true, type: true, genres: true, avatarImage: true } },
      promoterProfile: { select: { name: true, slug: true } }
    }
  });

  if (!show) {
    return NextResponse.json({ error: 'Show not found.' }, { status: 404 });
  }

  return NextResponse.json({ show });
}
