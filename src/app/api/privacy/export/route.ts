import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordAuditEvent } from '@/lib/audit';
import { consumeRateLimit, rateLimitKey } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Real, instant, read-only export of everything iHYPE holds tied to the
// signed-in user — no side effects, so (unlike deletion/detach/hype-wipe)
// this is safe to run automatically rather than routing through support.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const rl = await consumeRateLimit(rateLimitKey('privacy-export', session.user.id, null), { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests — try again later.' }, { status: 429 });

  const userId = session.user.id;

  const [user, profiles, ticketOrders, hypeEvents, profileHypeEvents, favoriteMedia, fanPlaylists] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, username: true, role: true,
        createdAt: true, isThirteenOrOlder: true,
        notificationPreference: true,
      },
    }),
    db.profile.findMany({
      where: { ownerId: userId },
      select: { id: true, slug: true, name: true, type: true, city: true, stateRegion: true, bio: true, genres: true, createdAt: true },
    }),
    db.ticketOrder.findMany({
      where: { buyerUserId: userId },
      select: { id: true, confirmationCode: true, status: true, quantity: true, subtotalCents: true, totalChargeCents: true, createdAt: true, show: { select: { title: true, slug: true, startsAt: true } } },
    }),
    db.hypeEvent.findMany({ where: { userId }, select: { showId: true, createdAt: true } }),
    db.profileHypeEvent.findMany({ where: { userId }, select: { profileId: true, createdAt: true } }),
    db.fanFavoriteMedia.findMany({ where: { userId }, select: { title: true, artistName: true, createdAt: true } }),
    db.fanPlaylist.findMany({ where: { userId }, select: { name: true, createdAt: true, items: { select: { title: true, artistName: true } } } }),
  ]);

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await recordAuditEvent({
    actorUserId: userId,
    action: 'privacy_export_downloaded',
    entityType: 'user',
    entityId: userId,
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    account: user,
    profiles,
    ticketOrders,
    hypeEvents,
    profileHypeEvents,
    favoriteMedia,
    fanPlaylists,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ihype-data-export-${userId}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
