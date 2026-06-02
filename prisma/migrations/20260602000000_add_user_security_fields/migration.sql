-- Add security and session tracking columns to User table.
-- These were present in schema.prisma but never had a migration file.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "userSecurityVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastLoginCountry"    TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginAt"         TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "tosAcceptedAt"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "emailBounced"        BOOLEAN NOT NULL DEFAULT false;
