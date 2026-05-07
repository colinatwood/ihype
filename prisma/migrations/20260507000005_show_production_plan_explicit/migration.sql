-- Add productionPlanVersion to Show for schema evolution tracking
ALTER TABLE "Show" ADD COLUMN "productionPlanVersion" INTEGER NOT NULL DEFAULT 1;

-- Extract advertising config from productionPlan JSON into a queryable table
CREATE TABLE "ShowAdvertisingConfig" (
  "id"        TEXT NOT NULL,
  "showId"    TEXT NOT NULL,
  "enabled"   BOOLEAN NOT NULL DEFAULT true,
  "scope"     TEXT NOT NULL DEFAULT 'local',
  "frequency" INTEGER NOT NULL DEFAULT 3,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShowAdvertisingConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShowAdvertisingConfig_showId_key" ON "ShowAdvertisingConfig"("showId");

ALTER TABLE "ShowAdvertisingConfig"
  ADD CONSTRAINT "ShowAdvertisingConfig_showId_fkey"
  FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
