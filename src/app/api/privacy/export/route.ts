import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordAuditEvent } from '@/lib/audit';
import { consumeRateLimit, rateLimitKey } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const OMITTED_EXPORT_KEYS = new Set([
  'passwordHash',
  'mfaSecret',
  'mfaBackupCodes',
  'adminDeviceTokenHash',
  'storedPaymentTokenRef',
  'stripeCustomerId',
  'stripeConnectAccountId',
  'stripePaymentIntentId',
  'paymentTokenRef',
  'sessionToken',
  'refresh_token',
  'access_token',
  'id_token',
  'token',
  'tokenHash',
  'codeHash',
  'credentialId',
  'publicKey',
  'counter',
  'auth',
  'p256dh',
  'endpoint',
  'deviceToken',
  'fileDataBase64',
  'storageKey',
]);

function sanitizeForExport(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeForExport);
  if (typeof value !== 'object') return value;

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (OMITTED_EXPORT_KEYS.has(key)) continue;
    result[key] = sanitizeForExport(child);
  }
  return result;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const userId = session.user.id;
  const rateLimit = await consumeRateLimit(
    rateLimitKey('privacy-export', userId, null),
    { limit: 5, windowMs: 60 * 60 * 1000 },
  );
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const userData = await db.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      sessions: true,
      profiles: {
        include: {
          hostedShows: true,
          headlinerShows: true,
          promotedShows: true,
          mediaUploads: true,
          profileHypes: true,
          venueConnectionRequests: true,
          recommendedConnectionRequests: true,
          issuedTickets: true,
          affiliateTicketOrders: true,
          accountsPayableEntries: true,
          journalPosts: true,
          followers: true,
          setlistTemplates: true,
          availabilityDates: true,
          receivedBookingRequests: true,
          promoCodes: true,
          newsletterSubscriptions: true,
        },
      },
      shows: {
        include: {
          radioTracks: true,
          comments: true,
          rsvps: true,
          attendees: true,
          setlistVotes: true,
          promoCodes: true,
          advertisingConfig: true,
        },
      },
      ticketOrders: {
        include: {
          tickets: true,
          accountsPayableEntries: true,
          show: true,
        },
      },
      hypeEvents: true,
      mediaListens: true,
      showListens: true,
      profileHypeEvents: true,
      passwordResetCodes: true,
      venueConnectionRequests: true,
      scannedTickets: true,
      reassignedTickets: true,
      fanPlaylists: { include: { items: true } },
      favoriteMedia: true,
      auditLogs: true,
      contentReports: true,
      seeds: true,
      passkeys: true,
      showComments: true,
      showRsvps: true,
      premiumInterests: true,
      notificationPreference: true,
      follows: true,
      notifications: true,
      magicLinkTokens: true,
      pushSubscriptions: true,
      nativeDeviceTokens: true,
      badges: true,
      showAttendees: true,
      setlistVotes: true,
      sentBookingRequests: true,
      advertisedAds: true,
    },
  });

  if (!userData) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await recordAuditEvent({
    actorUserId: userId,
    action: 'privacy_export_downloaded',
    entityType: 'user',
    entityId: userId,
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    formatVersion: 2,
    notice:
      'Credential secrets, session tokens, payment processor identifiers, push credentials, and raw binary media are intentionally excluded for account security.',
    data: sanitizeForExport(userData),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="ihype-data-export-${userId}.json"`,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
