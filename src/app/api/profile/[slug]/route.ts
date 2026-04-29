import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const profile = await db.profile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      hexId: true,
      type: true,
      name: true,
      headline: true,
      bio: true,
      aboutContent: true,
      hometown: true,
      city: true,
      stateRegion: true,
      country: true,
      addressLine1: true,
      contactInfo: true,
      hoursText: true,
      genres: true,
      hypeCount: true,
      verified: true,
      avatarImage: true,
      heroImage: true,
      logoImage: true,
      galleryImage: true,
      featureVideoUrl: true,
      parkingDetails: true,
      fanShareEnabled: true,
      createdAt: true,
    }
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const now = new Date();

  // Upcoming shows — role-appropriate relation
  const showWhere = {
    status: { in: ['SCHEDULED', 'LIVE'] as const },
    startsAt: { gte: now },
  };

  const [shows, tracks] = await Promise.all([
    db.show.findMany({
      where: {
        ...showWhere,
        OR: [
          { venueProfileId:      profile.id },
          { headlinerProfileId:  profile.id },
          { promoterProfileId:   profile.id },
        ],
      },
      orderBy: { startsAt: 'asc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        startsAt: true,
        isRadioShow: true,
        isTicketed: true,
        ticketPriceCents: true,
        posterImage: true,
        tags: true,
        venueProfile:     { select: { name: true, slug: true, city: true, stateRegion: true } },
        headlinerProfile: { select: { name: true, slug: true } },
        promoterProfile:  { select: { name: true, slug: true } },
      },
    }),

    profile.type === 'ARTIST'
      ? db.artistMediaAsset.findMany({
          where: { profileId: profile.id, freeUseEnabled: true },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: { hexId: true, title: true, mimeType: true, notes: true, createdAt: true },
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({ profile, shows, tracks });
}
