-- Performance indexes for Show/Seed hot paths.
--
-- NOTE: these were originally written with CREATE INDEX CONCURRENTLY, but
-- Prisma's migration engine runs each migration inside a transaction, and
-- CONCURRENTLY cannot run inside a transaction block — so the migration failed
-- (P3009) and blocked deploys. Rewritten as plain CREATE INDEX, which is
-- transaction-safe. These tables are small enough at this stage that the brief
-- build lock is acceptable. DROP IF EXISTS first so the migration is idempotent
-- and recovers cleanly from any partial/invalid index left by the failed run.

-- CreateIndex
DROP INDEX IF EXISTS "Show_status_idx";
CREATE INDEX IF NOT EXISTS "Show_status_idx" ON "Show"("status");

-- CreateIndex
DROP INDEX IF EXISTS "Show_isRadioShow_status_idx";
CREATE INDEX IF NOT EXISTS "Show_isRadioShow_status_idx" ON "Show"("isRadioShow", "status");

-- CreateIndex
DROP INDEX IF EXISTS "Seed_mediaId_action_idx";
CREATE INDEX IF NOT EXISTS "Seed_mediaId_action_idx" ON "Seed"("mediaId", "action");
