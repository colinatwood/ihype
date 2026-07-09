from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{path}: expected one patch anchor, found {count}')
    target.write_text(text.replace(old, new, 1), encoding='utf-8')


# Prisma model for server-side, one-time passkey bootstrap capabilities.
replace_once(
    'prisma/schema.prisma',
    '  passkeys                Passkey[]\n',
    '  passkeys                Passkey[]\n  passkeyBootstrapTokens PasskeyBootstrapToken[]\n',
)
replace_once(
    'prisma/schema.prisma',
    '''model Passkey {
  id                   String   @id @default(cuid())
  userId               String
  credentialId         String   @unique
  publicKey            Bytes
  counter              BigInt   @default(0)
  deviceType           String
  backedUp             Boolean  @default(false)
  transports           String?
  name                 String?
  createdAt            DateTime @default(now())
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
''',
    '''model Passkey {
  id                   String   @id @default(cuid())
  userId               String
  credentialId         String   @unique
  publicKey            Bytes
  counter              BigInt   @default(0)
  deviceType           String
  backedUp             Boolean  @default(false)
  transports           String?
  name                 String?
  createdAt            DateTime @default(now())
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model PasskeyBootstrapToken {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  userId    String
  challenge String?
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
  @@index([expiresAt])
}
''',
)

# Registration creates the random bootstrap capability inside the same DB
# transaction as the account and never sends a user ID as authorization state.
replace_once(
    'src/app/api/register/route.ts',
    "import { runRegistrationPostProcessing } from '@/lib/registration-post-processing';\n",
    "import { runRegistrationPostProcessing } from '@/lib/registration-post-processing';\nimport {\n  createPasskeyBootstrapCapability,\n  getPasskeyBootstrapCookieName,\n  getPasskeyBootstrapCookieOptions,\n} from '@/lib/passkey-bootstrap';\n",
)
replace_once(
    'src/app/api/register/route.ts',
    '''    const profileName = profileType === 'LISTENER' ? hexId : trimmedName;
    const profileCopyName = profileType === 'LISTENER' ? normalizedUsername : trimmedName;

    const { user, profile } = await db.$transaction(async (tx) => {
''',
    '''    const profileName = profileType === 'LISTENER' ? hexId : trimmedName;
    const profileCopyName = profileType === 'LISTENER' ? normalizedUsername : trimmedName;
    const passkeyBootstrap = body.passkeyFlow ? createPasskeyBootstrapCapability() : null;

    const { user, profile } = await db.$transaction(async (tx) => {
''',
)
replace_once(
    'src/app/api/register/route.ts',
    '''      return { user: createdUser, profile: createdProfile };
''',
    '''      if (passkeyBootstrap) {
        await tx.passkeyBootstrapToken.create({
          data: {
            userId: createdUser.id,
            tokenHash: passkeyBootstrap.tokenHash,
            expiresAt: passkeyBootstrap.expiresAt,
          },
        });
      }

      return { user: createdUser, profile: createdProfile };
''',
)
replace_once(
    'src/app/api/register/route.ts',
    '''    if (body.passkeyFlow) {
      response.cookies.set('pk_reg_first_uid', user.id, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 600,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });
    }
''',
    '''    if (passkeyBootstrap) {
      response.cookies.set(
        getPasskeyBootstrapCookieName(),
        passkeyBootstrap.token,
        getPasskeyBootstrapCookieOptions(),
      );
      response.cookies.delete('pk_reg_first_uid');
      response.cookies.delete('pk_reg_first_challenge');
    }
''',
)

# Enforce ticket entitlement before a production plan reaches the client and
# rewrite artist storage URLs to the authorization-checking media endpoint.
replace_once(
    'src/app/shows/[slug]/page.tsx',
    "import { parseShowProductionPlan } from '@/lib/show-composer';\n",
    "import { parseShowProductionPlan } from '@/lib/show-composer';\nimport { canViewerAccessShowMedia, protectShowProductionPlan } from '@/lib/show-media-access';\n",
)
replace_once(
    'src/app/shows/[slug]/page.tsx',
    '''        ticketOrders: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: { tickets: { select: { reassignCount: true } } }
        },
''',
    '',
)
replace_once(
    'src/app/shows/[slug]/page.tsx',
    '''  const visibility = getShowVisibilitySignals(show);
  const productionPlan = parseShowProductionPlan(show.productionPlan);

  const hasTicket = session?.user?.id
    ? await db.ticket.findFirst({
        where: { showId: show.id, holderEmail: (await db.user.findUnique({ where: { id: session.user.id }, select: { email: true } }))?.email ?? '' },
        select: { id: true }
      }).then(Boolean)
    : false;

  const canWatch = !show.isTicketed || hasTicket || (session?.user?.id === show.creatorId) || isAdminSession(session);
  void canWatch;
''',
    '''  const visibility = getShowVisibilitySignals(show);
  const canWatch = await canViewerAccessShowMedia({
    showId: show.id,
    isTicketed: show.isTicketed,
    creatorId: show.creatorId,
    userId: session?.user?.id,
    role: currentFan?.role ?? session?.user?.role,
    email: currentFan?.email ?? session?.user?.email,
  });
  const rawProductionPlan = parseShowProductionPlan(show.productionPlan);
  const productionPlan = canWatch && rawProductionPlan
    ? protectShowProductionPlan(rawProductionPlan, show.id)
    : null;
''',
)
replace_once(
    'src/app/shows/[slug]/page.tsx',
    '''            {productionPlan ? (
              <ShowSequencePlayer
                autoPlay={show.status === 'LIVE'}
                isPreview={show.status === 'DRAFT'}
                productionPlan={productionPlan}
                showId={show.id}
                showSlug={show.slug}
                title={show.title}
              />
            ) : (
              <div style={{ minHeight: 160, position: 'relative', overflow: 'hidden', borderRadius: 12, background: 'rgba(255,255,255,.04)' }}>
                {show.posterImage
                  ? <Image alt={show.title} src={show.posterImage} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
                  : <span className="meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>No audio uploaded yet</span>}
              </div>
            )}
''',
    '''            {productionPlan ? (
              <ShowSequencePlayer
                autoPlay={show.status === 'LIVE'}
                isPreview={show.status === 'DRAFT'}
                productionPlan={productionPlan}
                showId={show.id}
                showSlug={show.slug}
                title={show.title}
              />
            ) : show.isTicketed && !canWatch ? (
              <div className="empty" style={{ minHeight: 160, display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
                <div>
                  <strong>Ticket required for playback</strong>
                  <p className="meta" style={{ marginTop: 8 }}>
                    Sign in with the ticket holder account or purchase a ticket to unlock this show.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ minHeight: 160, position: 'relative', overflow: 'hidden', borderRadius: 12, background: 'rgba(255,255,255,.04)' }}>
                {show.posterImage
                  ? <Image alt={show.title} src={show.posterImage} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
                  : <span className="meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>No audio uploaded yet</span>}
              </div>
            )}
''',
)

# Reserve upload quota under a row lock, publish only after storage succeeds,
# and compensate both the DB reservation and R2 object on failure.
replace_once(
    'src/app/api/artist-media/route.ts',
    "import { NextResponse } from 'next/server';\n",
    "import { NextResponse } from 'next/server';\nimport { Prisma } from '@prisma/client';\n",
)
replace_once(
    'src/app/api/artist-media/route.ts',
    "import { isBlobMediaStorageAvailable, uploadArtistMediaToBlob } from '@/lib/media-storage';\n",
    "import { deleteArtistMediaFromBlob, isBlobMediaStorageAvailable, uploadArtistMediaToBlob } from '@/lib/media-storage';\n",
)
replace_once(
    'src/app/api/artist-media/route.ts',
    '''const MAX_PROFILE_TRACKS = 100;
''',
    '''const MAX_PROFILE_TRACKS = 100;

class MediaQuotaError extends Error {}
''',
)
replace_once(
    'src/app/api/artist-media/route.ts',
    '''    const usage = await db.artistMediaAsset.aggregate({
      where: { profileId: profile.id },
      _count: { _all: true },
      _sum: { fileSizeBytes: true },
    });
    const trackCount = usage._count._all;
    const usedBytes = usage._sum.fileSizeBytes ?? 0;
    if (trackCount >= MAX_PROFILE_TRACKS) {
      return NextResponse.json(
        { error: `Each artist profile is limited to ${MAX_PROFILE_TRACKS} uploaded tracks.` },
        { status: 413 },
      );
    }
    if (usedBytes + file.size > MAX_PROFILE_STORAGE_BYTES) {
      return NextResponse.json(
        { error: 'This upload would exceed the 250MB storage limit for the artist profile.' },
        { status: 413 },
      );
    }

''',
    '',
)
replace_once(
    'src/app/api/artist-media/route.ts',
    '''    const title = (requestedTitle || deriveTitleFromFileName(file.name)).slice(0, 160);
    const hexId = createHexId();
    const hasBlobStorage = await isBlobMediaStorageAvailable();

    if (!hasBlobStorage && !(await areDatabaseMediaUploadsEnabledRuntime())) {
      return NextResponse.json(
        {
          error:
            'Media uploads require object storage before production use. Configure Cloudflare R2 or enable the temporary database storage flag.',
        },
        { status: 501 },
      );
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const durationSecs = parseAudioDuration(fileBytes) ?? null;

    let effectiveFreeUse = freeUseEnabled;
    let vetting: Awaited<ReturnType<typeof vetFreeUseSample>> | null = null;
    if (freeUseEnabled) {
      vetting = await vetFreeUseSample({
        title,
        notes: notesValue || null,
        fileName: file.name || '',
        artistName: profile.name,
        durationSecs,
      });
      effectiveFreeUse = vetting.cleared;
    }

    const storedMedia = hasBlobStorage
      ? await uploadArtistMediaToBlob({ file, hexId, profileId: profile.id })
      : null;
    const fileDataBase64 = storedMedia ? null : Buffer.from(fileBytes).toString('base64');

    const updatedProfile = await withDbRetry(() =>
      db.profile.update({
        where: { id: profile.id },
        data: {
          songUploadCount: { increment: 1 },
          mediaUploads: {
            create: {
              hexId,
              title,
              notes: notesValue || null,
              originalFileName: file.name || `${hexId}.audio`,
              mimeType: file.type,
              fileSizeBytes: file.size,
              fileDataBase64,
              storageProvider: storedMedia?.provider ?? 'database',
              storageKey: storedMedia?.key ?? null,
              storageUrl: storedMedia?.url ?? null,
              freeUseEnabled: effectiveFreeUse,
              durationSecs,
            },
          },
        },
        select: {
          mediaUploads: {
            where: { hexId },
            select: {
              hexId: true,
              title: true,
              notes: true,
              mimeType: true,
              fileSizeBytes: true,
              freeUseEnabled: true,
              createdAt: true,
            },
          },
        },
      }),
    );
    const asset = updatedProfile.mediaUploads[0];
    if (!asset) throw new Error('Artist media upload did not return the created asset.');
''',
    '''    const title = (requestedTitle || deriveTitleFromFileName(file.name)).slice(0, 160);
    const hexId = createHexId();
    const hasBlobStorage = await isBlobMediaStorageAvailable();

    if (!hasBlobStorage && !(await areDatabaseMediaUploadsEnabledRuntime())) {
      return NextResponse.json(
        {
          error:
            'Media uploads require object storage before production use. Configure Cloudflare R2 or enable the temporary database storage flag.',
        },
        { status: 501 },
      );
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const durationSecs = parseAudioDuration(fileBytes) ?? null;

    let effectiveFreeUse = freeUseEnabled;
    let vetting: Awaited<ReturnType<typeof vetFreeUseSample>> | null = null;
    if (freeUseEnabled) {
      vetting = await vetFreeUseSample({
        title,
        notes: notesValue || null,
        fileName: file.name || '',
        artistName: profile.name,
        durationSecs,
      });
      effectiveFreeUse = vetting.cleared;
    }

    let reservedAssetId: string | null = null;
    let storedMedia: Awaited<ReturnType<typeof uploadArtistMediaToBlob>> | null = null;
    let asset: {
      hexId: string;
      title: string;
      notes: string | null;
      mimeType: string;
      fileSizeBytes: number;
      freeUseEnabled: boolean;
      createdAt: Date;
    };

    try {
      const reserved = await withDbRetry(() =>
        db.$transaction(async (tx) => {
          await tx.$queryRaw(
            Prisma.sql`SELECT "id" FROM "Profile" WHERE "id" = ${profile.id} FOR UPDATE`,
          );
          const usage = await tx.artistMediaAsset.aggregate({
            where: { profileId: profile.id },
            _count: { _all: true },
            _sum: { fileSizeBytes: true },
          });
          if (usage._count._all >= MAX_PROFILE_TRACKS) {
            throw new MediaQuotaError(
              `Each artist profile is limited to ${MAX_PROFILE_TRACKS} uploaded tracks.`,
            );
          }
          if ((usage._sum.fileSizeBytes ?? 0) + file.size > MAX_PROFILE_STORAGE_BYTES) {
            throw new MediaQuotaError(
              'This upload would exceed the 250MB storage limit for the artist profile.',
            );
          }

          await tx.profile.update({
            where: { id: profile.id },
            data: { songUploadCount: { increment: 1 } },
          });
          return tx.artistMediaAsset.create({
            data: {
              hexId,
              title,
              notes: notesValue || null,
              originalFileName: file.name || `${hexId}.audio`,
              mimeType: file.type,
              fileSizeBytes: file.size,
              storageProvider: 'pending',
              freeUseEnabled: effectiveFreeUse,
              durationSecs,
              profileId: profile.id,
              isPublished: false,
            },
            select: { id: true },
          });
        }),
      );
      reservedAssetId = reserved.id;

      storedMedia = hasBlobStorage
        ? await uploadArtistMediaToBlob({ file, hexId, profileId: profile.id })
        : null;
      const fileDataBase64 = storedMedia ? null : Buffer.from(fileBytes).toString('base64');

      asset = await withDbRetry(() =>
        db.artistMediaAsset.update({
          where: { id: reserved.id },
          data: {
            fileDataBase64,
            storageProvider: storedMedia?.provider ?? 'database',
            storageKey: storedMedia?.key ?? null,
            storageUrl: storedMedia?.url ?? null,
            isPublished: true,
          },
          select: {
            hexId: true,
            title: true,
            notes: true,
            mimeType: true,
            fileSizeBytes: true,
            freeUseEnabled: true,
            createdAt: true,
          },
        }),
      );
    } catch (error) {
      if (storedMedia?.key) {
        await deleteArtistMediaFromBlob(storedMedia.key).catch((cleanupError) => {
          console.error('[artist-media] failed to remove orphaned R2 object', cleanupError);
        });
      }
      if (reservedAssetId) {
        await db.$transaction(async (tx) => {
          const deleted = await tx.artistMediaAsset.deleteMany({
            where: { id: reservedAssetId!, isPublished: false },
          });
          if (deleted.count === 1) {
            await tx.profile.updateMany({
              where: { id: profile.id, songUploadCount: { gt: 0 } },
              data: { songUploadCount: { decrement: 1 } },
            });
          }
        }).catch((cleanupError) => {
          console.error('[artist-media] failed to release upload reservation', cleanupError);
        });
      }
      throw error;
    }
''',
)
replace_once(
    'src/app/api/artist-media/route.ts',
    '''  } catch (error) {
    console.error('Artist media upload failed', error);
    return NextResponse.json({ error: 'Could not upload this media item.' }, { status: 500 });
  }
''',
    '''  } catch (error) {
    if (error instanceof MediaQuotaError) {
      return NextResponse.json({ error: error.message }, { status: 413 });
    }
    console.error('Artist media upload failed', error);
    return NextResponse.json({ error: 'Could not upload this media item.' }, { status: 500 });
  }
''',
)

# Mandatory authenticated Workerd checks exercise the actual production
# runtime, seeded with a ticketed show and two real session cookies.
replace_once(
    'scripts/workerd-smoke.mjs',
    "import { readFileSync, writeFileSync, rmSync } from 'node:fs';\n",
    "import { readFileSync, writeFileSync, rmSync } from 'node:fs';\nimport { Client } from 'pg';\nimport { encode } from 'next-auth/jwt';\n",
)
replace_once(
    'scripts/workerd-smoke.mjs',
    '''const TMP_CONFIG = '.wrangler-workerd-smoke.toml';
''',
    '''const TMP_CONFIG = '.wrangler-workerd-smoke.toml';
const FIXTURE = {
  creatorId: 'workerd-smoke-creator',
  outsiderId: 'workerd-smoke-outsider',
  profileId: 'clx0000000000000000000000',
  showId: 'workerd-smoke-ticketed-show',
  showSlug: 'workerd-smoke-ticketed-show',
  mediaHexId: '0xabc123deadbeef',
  outsiderEmail: 'outsider-private@example.com',
  privateMessage: 'OUTSIDER_PRIVATE_MESSAGE_DO_NOT_EXPORT',
  rawStorageMarker: 'https://storage.invalid/RAW_PRIVATE_MEDIA_MARKER.mp3',
};
''',
)
replace_once(
    'scripts/workerd-smoke.mjs',
    '''function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
''',
    '''function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedSecurityFixtures() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  const now = new Date();
  const productionPlan = {
    mediaItems: [{
      mediaId: FIXTURE.mediaHexId,
      title: 'Protected smoke track',
      url: FIXTURE.rawStorageMarker,
      artistProfileId: FIXTURE.profileId,
      artistName: 'Smoke Artist',
      mediaType: 'audio',
    }],
    voiceOvers: [],
    samplePads: [],
    sequence: [{ id: 'track-one', kind: 'MEDIA', refId: FIXTURE.mediaHexId, label: 'Protected track' }],
    advertising: { enabled: false, scope: 'local', frequency: 3, clips: [] },
  };

  try {
    await client.query(
      `INSERT INTO "User" ("id", "name", "email", "username", "role", "isThirteenOrOlder", "emailVerified", "userSecurityVersion", "createdAt", "updatedAt")
       VALUES ($1, 'Smoke Creator', 'creator-smoke@example.com', 'smokecreator', 'ARTIST'::"Role", true, $3, 0, $3, $3),
              ($2, 'Smoke Outsider', $4, 'smokeoutsider', 'FAN'::"Role", true, $3, 0, $3, $3)`,
      [FIXTURE.creatorId, FIXTURE.outsiderId, now, FIXTURE.outsiderEmail],
    );
    await client.query(
      `INSERT INTO "Profile" ("id", "slug", "hexId", "type", "name", "ownerId", "genres", "createdAt", "updatedAt")
       VALUES ($1, 'smoke-artist', '0xsmokeartist', 'ARTIST'::"ProfileType", 'Smoke Artist', $2, ARRAY['test']::TEXT[], $3, $3)`,
      [FIXTURE.profileId, FIXTURE.creatorId, now],
    );
    await client.query(
      `INSERT INTO "ArtistMediaAsset" ("id", "hexId", "title", "originalFileName", "mimeType", "fileSizeBytes", "fileDataBase64", "storageProvider", "freeUseEnabled", "sortOrder", "profileId", "isPublished", "createdAt", "updatedAt")
       VALUES ('workerd-smoke-asset', $1, 'Protected smoke track', 'smoke.mp3', 'audio/mpeg', 10, $2, 'database', false, 0, $3, true, $4, $4)`,
      [FIXTURE.mediaHexId, Buffer.from('ID3SMOKE').toString('base64'), FIXTURE.profileId, now],
    );
    await client.query(
      `INSERT INTO "Show" ("id", "slug", "title", "status", "startsAt", "creatorId", "isTicketed", "ticketPriceCents", "venuePayoutPercent", "artistPayoutPercent", "ticketsSoldCount", "hypeCount", "tags", "isRadioShow", "promoterPayoutPercent", "productionPlan", "createdAt", "updatedAt")
       VALUES ($1, $2, 'Protected Workerd Smoke Show', 'SCHEDULED'::"ShowStatus", $3, $4, true, 1000, 50, 45, 0, 0, ARRAY['test']::TEXT[], false, 5, $5::jsonb, $6, $6)`,
      [FIXTURE.showId, FIXTURE.showSlug, new Date(now.getTime() + 86_400_000), FIXTURE.creatorId, JSON.stringify(productionPlan), now],
    );
    await client.query(
      `INSERT INTO "Follow" ("id", "followerId", "followeeProfileId", "notifyShows", "createdAt")
       VALUES ('workerd-smoke-follow', $1, $2, true, $3)`,
      [FIXTURE.outsiderId, FIXTURE.profileId, now],
    );
    await client.query(
      `INSERT INTO "BookingRequest" ("id", "fromUserId", "toProfileId", "message", "status", "createdAt", "updatedAt")
       VALUES ('workerd-smoke-booking', $1, $2, $3, 'pending', $4, $4)`,
      [FIXTURE.outsiderId, FIXTURE.profileId, FIXTURE.privateMessage, now],
    );
  } finally {
    await client.end();
  }
}

async function buildSmokeSessionCookie({ userId, email, role }) {
  const cookieName = '__Secure-authjs.session-token';
  const now = Math.floor(Date.now() / 1000);
  const value = await encode({
    token: {
      sub: userId,
      name: userId,
      email,
      role,
      emailVerified: new Date().toISOString(),
      securityVersion: 0,
      iat: now,
      exp: now + 3600,
      jti: `workerd-smoke-${userId}`,
    },
    secret: AUTH_SECRET,
    salt: cookieName,
    maxAge: 3600,
  });
  return `${cookieName}=${value}`;
}
''',
)
replace_once(
    'scripts/workerd-smoke.mjs',
    '''async function run() {
  writeStrippedConfig();

  const child = spawn(
''',
    '''async function run() {
  writeStrippedConfig();
  await seedSecurityFixtures();
  const creatorCookie = await buildSmokeSessionCookie({
    userId: FIXTURE.creatorId,
    email: 'creator-smoke@example.com',
    role: 'ARTIST',
  });
  const outsiderCookie = await buildSmokeSessionCookie({
    userId: FIXTURE.outsiderId,
    email: FIXTURE.outsiderEmail,
    role: 'FAN',
  });

  const child = spawn(
''',
)
replace_once(
    'scripts/workerd-smoke.mjs',
    '''    // 8. Performance budget. It must run against this workerd instance, not a
''',
    '''    // 8. Legacy user-ID bootstrap cookies must not authorize passkey setup.
    const forgedBootstrap = await probe('/api/auth/passkey/register-first', {
      headers: { cookie: `pk_reg_first_uid=${FIXTURE.creatorId}` },
    });
    check(
      'forged legacy passkey bootstrap cookie is rejected',
      forgedBootstrap.status === 400,
      `status=${forgedBootstrap.status} body=${forgedBootstrap.text.slice(0, 200)}`,
    );

    // 9. Ticketed show plans and raw storage URLs stay out of unauthorized RSC/HTML.
    const anonymousShow = await probe(`/shows/${FIXTURE.showSlug}`);
    check(
      'anonymous ticketed show response contains no protected media plan',
      anonymousShow.status === 200 &&
        !anonymousShow.text.includes(FIXTURE.rawStorageMarker) &&
        !anonymousShow.text.includes(`/api/shows/${FIXTURE.showId}/media/${FIXTURE.mediaHexId}`),
      `status=${anonymousShow.status}`,
    );
    const outsiderShow = await probe(`/shows/${FIXTURE.showSlug}`, {
      headers: { cookie: outsiderCookie },
    });
    check(
      'authenticated non-buyer receives no protected media plan',
      outsiderShow.status === 200 &&
        !outsiderShow.text.includes(FIXTURE.rawStorageMarker) &&
        !outsiderShow.text.includes(`/api/shows/${FIXTURE.showId}/media/${FIXTURE.mediaHexId}`),
      `status=${outsiderShow.status}`,
    );
    const creatorShow = await probe(`/shows/${FIXTURE.showSlug}`, {
      headers: { cookie: creatorCookie },
    });
    check(
      'show creator receives only the entitlement-checking media URL',
      creatorShow.status === 200 &&
        creatorShow.text.includes(`/api/shows/${FIXTURE.showId}/media/${FIXTURE.mediaHexId}`) &&
        !creatorShow.text.includes(FIXTURE.rawStorageMarker),
      `status=${creatorShow.status}`,
    );

    // 10. The media endpoint independently enforces entitlement.
    const outsiderMedia = await probe(`/api/shows/${FIXTURE.showId}/media/${FIXTURE.mediaHexId}`, {
      headers: { cookie: outsiderCookie },
    });
    check(
      'ticketed media rejects an authenticated non-buyer',
      outsiderMedia.status === 403,
      `status=${outsiderMedia.status} body=${outsiderMedia.text.slice(0, 200)}`,
    );
    const creatorMedia = await probe(`/api/shows/${FIXTURE.showId}/media/${FIXTURE.mediaHexId}`, {
      headers: { cookie: creatorCookie },
    });
    check(
      'ticketed media streams for the show creator',
      creatorMedia.status === 200 && creatorMedia.text.includes('ID3SMOKE'),
      `status=${creatorMedia.status} body=${creatorMedia.text.slice(0, 100)}`,
    );

    // 11. A user's export must not contain another person's identity or message.
    const privacyExport = await probe('/api/privacy/export', {
      headers: { cookie: creatorCookie, accept: 'application/json' },
    });
    check(
      'privacy export excludes third-party personal data',
      privacyExport.status === 200 &&
        !privacyExport.text.includes(FIXTURE.outsiderEmail) &&
        !privacyExport.text.includes(FIXTURE.outsiderId) &&
        !privacyExport.text.includes(FIXTURE.privateMessage),
      `status=${privacyExport.status} body=${privacyExport.text.slice(0, 200)}`,
    );

    // 12. Embed pages deliberately opt into framing without weakening other pages.
    const embed = await probe('/embed/does-not-exist');
    const embedCsp = embed.headers.get('content-security-policy') ?? '';
    check(
      'embed route permits framing through CSP and omits X-Frame-Options',
      embedCsp.includes('frame-ancestors *') && !embed.headers.has('x-frame-options'),
      `status=${embed.status} csp=${embedCsp}`,
    );

    // 13. Performance budget. It must run against this workerd instance, not a
''',
)

# Codify the security invariants so later refactors cannot quietly remove them.
replace_once(
    'scripts/lint-source.mjs',
    '''if (failures.length > 0) {
''',
    '''const firstPasskeyRoute = await text('src/app/api/auth/passkey/register-first/route.ts');
if (firstPasskeyRoute.includes("jar.get('pk_reg_first_uid')")) {
  fail('src/app/api/auth/passkey/register-first/route.ts', 'raw user-ID cookies must not authorize passkey bootstrap.');
}
if (!firstPasskeyRoute.includes('passkeyBootstrapToken.updateMany')) {
  fail('src/app/api/auth/passkey/register-first/route.ts', 'passkey bootstrap capabilities must be consumed atomically.');
}

const showPage = await text('src/app/shows/[slug]/page.tsx');
if (showPage.includes('void canWatch') || !showPage.includes('protectShowProductionPlan')) {
  fail('src/app/shows/[slug]/page.tsx', 'ticketed production plans must be entitlement-gated and URL-protected.');
}

const privacyExport = await text('src/app/api/privacy/export/route.ts');
for (const forbiddenInclude of ['issuedTickets: true', 'followers: true', 'receivedBookingRequests: true']) {
  if (privacyExport.includes(forbiddenInclude)) {
    fail('src/app/api/privacy/export/route.ts', `third-party relation must not be exported: ${forbiddenInclude}`);
  }
}

for (const workflowFile of ['.github/workflows/ci.yml', '.github/workflows/deploy-production.yml']) {
  const workflow = await text(workflowFile);
  for (const line of workflow.split('\\n')) {
    const match = line.match(/uses:\\s+([^@\\s]+)@([^#\\s]+)/);
    if (match && !/^[a-f0-9]{40}$/.test(match[2])) {
      fail(workflowFile, `GitHub Action must be pinned to a full commit SHA: ${line.trim()}`);
    }
  }
}

if (failures.length > 0) {
''',
)

print('Audit remediation patches applied successfully.')
