import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  if (!profileId) return NextResponse.json({ error: 'profileId required.' }, { status: 400 });

  // verify ownership
  const profile = await db.profile.findUnique({ where: { id: profileId }, select: { ownerId: true } });
  if (!profile || profile.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const templates = await db.setlistTemplate.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let profileId: string, name: string, tracks: unknown;
  try {
    const body = await request.json();
    profileId = body.profileId;
    name = body.name;
    tracks = body.tracks;
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  if (!profileId || !name) return NextResponse.json({ error: 'profileId and name required.' }, { status: 400 });

  const profile = await db.profile.findUnique({ where: { id: profileId }, select: { ownerId: true } });
  if (!profile || profile.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const template = await db.setlistTemplate.create({
    data: { profileId, name, tracks: tracks ?? [] }
  });

  return NextResponse.json({ template }, { status: 201 });
}
