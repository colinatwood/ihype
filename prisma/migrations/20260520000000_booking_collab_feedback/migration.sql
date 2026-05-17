-- AlterTable Show: add setlistProgress (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Show' AND column_name='setlistProgress'
  ) THEN
    ALTER TABLE "Show" ADD COLUMN "setlistProgress" JSONB;
  END IF;
END $$;

-- CreateTable BookingRequest
CREATE TABLE IF NOT EXISTS "BookingRequest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toProfileId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BookingRequest_toProfileId_status_idx" ON "BookingRequest"("toProfileId", "status");
CREATE INDEX IF NOT EXISTS "BookingRequest_fromUserId_createdAt_idx" ON "BookingRequest"("fromUserId", "createdAt");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='BookingRequest_fromUserId_fkey'
  ) THEN
    ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='BookingRequest_toProfileId_fkey'
  ) THEN
    ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_toProfileId_fkey" FOREIGN KEY ("toProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable CollabPost
CREATE TABLE IF NOT EXISTS "CollabPost" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CollabPost_active_createdAt_idx" ON "CollabPost"("active", "createdAt");
CREATE INDEX IF NOT EXISTS "CollabPost_profileId_idx" ON "CollabPost"("profileId");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='CollabPost_profileId_fkey'
  ) THEN
    ALTER TABLE "CollabPost" ADD CONSTRAINT "CollabPost_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable FeatureRequest
CREATE TABLE IF NOT EXISTS "FeatureRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FeatureRequest_status_votes_idx" ON "FeatureRequest"("status", "votes");
CREATE INDEX IF NOT EXISTS "FeatureRequest_createdAt_idx" ON "FeatureRequest"("createdAt");
