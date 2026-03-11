import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.discriminatedUnion('targetType', [
  z.object({ targetType: z.literal('show'), targetId: z.string().cuid() }),
  z.object({ targetType: z.literal('profile'), targetId: z.string().cuid() })
]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());

    if (payload.targetType === 'show') {
      const existing = await db.hypeEvent.findUnique({
        where: { userId_showId: { userId: session.user.id, showId: payload.targetId } }
      });

      if (existing) {
        const show = await db.show.findUniqueOrThrow({ where: { id: payload.targetId } });
        return NextResponse.json({ created: false, hypeCount: show.hypeCount });
      }

      const [, updatedShow] = await db.$transaction([
        db.hypeEvent.create({ data: { userId: session.user.id, showId: payload.targetId } }),
        db.show.update({ where: { id: payload.targetId }, data: { hypeCount: { increment: 1 } } })
      ]);

      return NextResponse.json({ created: true, hypeCount: updatedShow.hypeCount });
    }

    const existing = await db.profileHypeEvent.findUnique({
      where: { userId_profileId: { userId: session.user.id, profileId: payload.targetId } }
    });

    if (existing) {
      const profile = await db.profile.findUniqueOrThrow({ where: { id: payload.targetId } });
      return NextResponse.json({ created: false, hypeCount: profile.hypeCount });
    }

    const [, updatedProfile] = await db.$transaction([
      db.profileHypeEvent.create({ data: { userId: session.user.id, profileId: payload.targetId } }),
      db.profile.update({ where: { id: payload.targetId }, data: { hypeCount: { increment: 1 } } })
    ]);

    return NextResponse.json({ created: true, hypeCount: updatedProfile.hypeCount });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
