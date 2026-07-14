-- Up to 4 stat keys (see src/lib/profile-stats.ts STAT_CATALOG) the owner
-- chose to display on their public profile's stat tiles.
ALTER TABLE "Profile" ADD COLUMN "pinnedStats" TEXT[] NOT NULL DEFAULT '{}';
