import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, action } = await params;
  if (!['save', 'skip', 'hype'].includes(action)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const media = await db.artistMediaAsset.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!media) {
      return NextResponse.json({ ok: false, error: 'Seed media was not found.' }, { status: 404 });
    }

    await db.seed.create({
      data: { userId: session.user.id, mediaId: id, action },
    });
  } catch (error) {
    console.error('[discover/seeds] failed to record action', error);
    return NextResponse.json({ ok: false, error: 'Could not record seed action.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
