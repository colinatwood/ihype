import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ProfileType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const VALID_TYPES: ProfileType[] = ['ARTIST', 'DJ', 'VENUE', 'LISTENER'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type')?.toUpperCase() as ProfileType | null;
  const limitParam = parseInt(searchParams.get('limit') ?? '40', 10);
  const limit = Math.min(Math.max(1, isNaN(limitParam) ? 40 : limitParam), 100);

  const where = typeParam && VALID_TYPES.includes(typeParam)
    ? { type: typeParam }
    : undefined;

  const profiles = await db.profile.findMany({
    where,
    orderBy: [{ hypeCount: 'desc' }, { verified: 'desc' }, { name: 'asc' }],
    take: limit,
    select: {
      id: true,
      slug: true,
      hexId: true,
      type: true,
      name: true,
      bio: true,
      headline: true,
      city: true,
      stateRegion: true,
      country: true,
      hypeCount: true,
      verified: true,
      avatarImage: true,
      genres: true
    }
  });

  return NextResponse.json(profiles);
}
