import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isDemoUser, shouldHideDemoContent } from '@/lib/runtime-flags';

export const dynamic = 'force-dynamic';

function getProfilePath(type: string, slug: string) {
  if (type === 'VENUE') return `/venues/${slug}`;
  if (type === 'DJ') return `/promoters/${slug}`;
  if (type === 'LISTENER') return `/fans/${slug}`;
  return `/artists/${slug}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profile = await db.profile.findUnique({
    where: { slug },
    select: {
      name: true,
      headline: true,
      bio: true,
      type: true,
      genres: true,
      city: true,
      stateRegion: true,
      country: true,
      hypeCount: true,
      avatarImage: true,
      owner: { select: { email: true, username: true } }
    }
  });

  if (!profile || (shouldHideDemoContent() && isDemoUser(profile.owner))) {
    return new NextResponse('Profile not found', { status: 404 });
  }

  return NextResponse.redirect(new URL(getProfilePath(profile.type, slug), request.url));
}
