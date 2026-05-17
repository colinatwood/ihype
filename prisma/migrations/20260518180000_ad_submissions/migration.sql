CREATE TABLE "AdSubmission" (
  "id"               TEXT NOT NULL,
  "advertiserName"   TEXT NOT NULL,
  "advertiserType"   TEXT NOT NULL,
  "campaignWebsite"  TEXT NOT NULL,
  "adTextCopy"       TEXT NOT NULL,
  "creativeAssetUrl" TEXT,
  "status"           TEXT NOT NULL DEFAULT 'pending',
  "aiReasoning"      TEXT,
  "reviewedAt"       TIMESTAMP(3),
  "reviewedBy"       TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdSubmission_pkey" PRIMARY KEY ("id")
);
