-- Add durable rate-limit buckets for production serverless deployments.
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- Prepare artist media for external object storage while preserving existing DB-backed assets.
ALTER TABLE "ArtistMediaAsset" ADD COLUMN "storageProvider" TEXT NOT NULL DEFAULT 'database';
ALTER TABLE "ArtistMediaAsset" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "ArtistMediaAsset" ADD COLUMN "storageUrl" TEXT;
ALTER TABLE "ArtistMediaAsset" ALTER COLUMN "fileDataBase64" DROP NOT NULL;
