import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const userId = session.user.id;

  const [user, profiles, hypeEvents, profileHypeEvents, follows, notifications, seeds] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true }
    }),
    db.profile.findMany({
      where: { ownerId: userId },
      select: { id: true, slug: true, name: true, type: true, city: true, genres: true, createdAt: true }
    }),
    db.hypeEvent.findMany({
      where: { userId },
      select: { showId: true, createdAt: true }
    }),
    db.profileHypeEvent.findMany({
      where: { userId },
      select: { profileId: true, createdAt: true }
    }),
    db.follow.findMany({
      where: { followerId: userId },
      select: { followeeProfileId: true, createdAt: true }
    }),
    db.notification.findMany({
      where: { userId },
      select: { type: true, body: true, read: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500
    }),
    db.seed.findMany({
      where: { userId },
      select: { mediaId: true, action: true, createdAt: true }
    })
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    profiles,
    hypeEvents,
    profileHypeEvents,
    follows,
    notifications,
    seeds
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ihype-data-export-${userId.slice(0, 8)}.json"`
    }
  });
}
