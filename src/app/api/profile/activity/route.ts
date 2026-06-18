import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const profile = await db.profile.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ hypers: [] });

  const events = await db.profileHypeEvent.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      id: true,
      createdAt: true,
      user: { select: { name: true, image: true } },
    },
  });

  return NextResponse.json({
    hypers: events.map(e => ({
      id: e.id,
      name: e.user?.name ?? 'Someone',
      image: e.user?.image ?? null,
      at: e.createdAt,
    })),
  });
}
