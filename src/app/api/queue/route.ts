import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const items = await db.userMediaQueue.findMany({
    where: { userId: session.user.id },
    orderBy: { position: 'asc' }
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let mediaId: string;
  try {
    const body = await request.json();
    mediaId = body.mediaId;
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  if (!mediaId) return NextResponse.json({ error: 'mediaId required.' }, { status: 400 });

  const last = await db.userMediaQueue.findFirst({
    where: { userId: session.user.id },
    orderBy: { position: 'desc' },
    select: { position: true }
  });

  const position = (last?.position ?? -1) + 1;
  const item = await db.userMediaQueue.create({
    data: { userId: session.user.id, mediaId, position }
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  await db.userMediaQueue.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({ ok: true });
}
