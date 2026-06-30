-- CreateIndex
-- Uses CONCURRENTLY so index builds don't take a write lock on the live
-- Show/Seed tables during deploy. Prisma's migration engine detects
-- CONCURRENTLY and runs these statements outside a transaction.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Show_status_idx" ON "Show"("status");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Show_isRadioShow_status_idx" ON "Show"("isRadioShow", "status");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Seed_mediaId_action_idx" ON "Seed"("mediaId", "action");
