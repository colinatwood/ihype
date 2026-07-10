-- Reconciles the migration history with the schema that production and
-- schema.prisma already share. Over time several features (aux queues,
-- promo codes, setlist votes, collab board, feature flags, DMCA/moderation
-- fields, media publishing fields, ...) were applied to the live database
-- directly without a migration file, so replaying the history no longer
-- reproduced the real schema and `prisma migrate dev` reported drift.
--
-- Every statement is idempotent: on production (where all of these objects
-- already exist) `prisma migrate deploy` records the migration as applied
-- without changing anything, while fresh databases (CI, shadow, local dev)
-- gain the missing objects. The deploy pipeline blocks on migrate deploy
-- failures, so keep any future edits to this file idempotent too.

-- DropIndex (superseded: Show(startsAt,status)/Show(status)/Show(isRadioShow,status)
-- and TicketOrder(buyerUserId) are the schema's current indexes)
DROP INDEX IF EXISTS "Show_headlinerProfileId_status_idx";
DROP INDEX IF EXISTS "Show_promoterProfileId_status_idx";
DROP INDEX IF EXISTS "Show_status_startsAt_idx";
DROP INDEX IF EXISTS "Show_venueProfileId_status_idx";
DROP INDEX IF EXISTS "TicketOrder_buyerUserId_createdAt_idx";
DROP INDEX IF EXISTS "TicketOrder_showId_createdAt_idx";

-- AlterTable
ALTER TABLE "AccountsPayableEntry" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- AlterTable (DROP DEFAULT is a silent no-op when no default exists)
ALTER TABLE "AdSubmission" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ArtistMediaAsset" ADD COLUMN IF NOT EXISTS "durationSecs" INTEGER;
ALTER TABLE "ArtistMediaAsset" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ArtistMediaAsset" ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ContentReport" DROP COLUMN IF EXISTS "note";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "fanMailLastSentAt" TIMESTAMP(3);
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "merchUrl" TEXT;

-- AlterTable
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "dmcaDeadline" TIMESTAMP(3);
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "dmcaStatus" TEXT;
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "moderationStatus" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "streamKeyMasked" TEXT;
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "streamPlaybackId" TEXT;
ALTER TABLE "Show" ADD COLUMN IF NOT EXISTS "streamProvider" TEXT;

-- AlterTable
ALTER TABLE "ShowAdvertisingConfig" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TicketOrder" ADD COLUMN IF NOT EXISTS "promoCodeId" TEXT;
ALTER TABLE "TicketOrder" ADD COLUMN IF NOT EXISTS "transferredAt" TIMESTAMP(3);
ALTER TABLE "TicketOrder" ADD COLUMN IF NOT EXISTS "transferredToEmail" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "welcomeDay3SentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "welcomeDay7SentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SetlistVote" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetlistVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CollabBoardPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabBoardPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuxQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuxQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuxItem" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AuxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "showId" TEXT,
    "profileId" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SetlistVote_showId_mediaId_idx" ON "SetlistVote"("showId", "mediaId");
CREATE UNIQUE INDEX IF NOT EXISTS "SetlistVote_showId_userId_mediaId_key" ON "SetlistVote"("showId", "userId", "mediaId");
CREATE INDEX IF NOT EXISTS "CollabBoardPost_createdAt_idx" ON "CollabBoardPost"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AuxQueue_slug_key" ON "AuxQueue"("slug");
CREATE INDEX IF NOT EXISTS "AuxQueue_userId_idx" ON "AuxQueue"("userId");
CREATE INDEX IF NOT EXISTS "AuxItem_queueId_idx" ON "AuxItem"("queueId");
CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX IF NOT EXISTS "PromoCode_showId_idx" ON "PromoCode"("showId");
CREATE INDEX IF NOT EXISTS "PromoCode_profileId_idx" ON "PromoCode"("profileId");
CREATE INDEX IF NOT EXISTS "ArtistMediaAsset_publishAt_isPublished_idx" ON "ArtistMediaAsset"("publishAt", "isPublished");
CREATE INDEX IF NOT EXISTS "Seed_mediaId_idx" ON "Seed"("mediaId");
CREATE UNIQUE INDEX IF NOT EXISTS "Seed_userId_mediaId_key" ON "Seed"("userId", "mediaId");

-- AddForeignKey (guarded: ADD CONSTRAINT has no IF NOT EXISTS form)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TicketOrder_promoCodeId_fkey') THEN
    ALTER TABLE "TicketOrder" ADD CONSTRAINT "TicketOrder_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SetlistVote_showId_fkey') THEN
    ALTER TABLE "SetlistVote" ADD CONSTRAINT "SetlistVote_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SetlistVote_userId_fkey') THEN
    ALTER TABLE "SetlistVote" ADD CONSTRAINT "SetlistVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuxItem_queueId_fkey') THEN
    ALTER TABLE "AuxItem" ADD CONSTRAINT "AuxItem_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "AuxQueue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PromoCode_showId_fkey') THEN
    ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PromoCode_profileId_fkey') THEN
    ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
