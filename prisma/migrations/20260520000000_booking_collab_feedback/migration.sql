-- AlterTable Show: add setlistProgress
ALTER TABLE "Show" ADD COLUMN "setlistProgress" JSONB;

-- CreateTable BookingRequest
CREATE TABLE "BookingRequest" (
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
CREATE INDEX "BookingRequest_toProfileId_status_idx" ON "BookingRequest"("toProfileId", "status");
CREATE INDEX "BookingRequest_fromUserId_createdAt_idx" ON "BookingRequest"("fromUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_toProfileId_fkey" FOREIGN KEY ("toProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable CollabPost
CREATE TABLE "CollabPost" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollabPost_active_createdAt_idx" ON "CollabPost"("active", "createdAt");
CREATE INDEX "CollabPost_profileId_idx" ON "CollabPost"("profileId");

-- AddForeignKey
ALTER TABLE "CollabPost" ADD CONSTRAINT "CollabPost_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable FeatureRequest
CREATE TABLE "FeatureRequest" (
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
CREATE INDEX "FeatureRequest_status_votes_idx" ON "FeatureRequest"("status", "votes");
CREATE INDEX "FeatureRequest_createdAt_idx" ON "FeatureRequest"("createdAt");
