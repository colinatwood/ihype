-- Normalized content blocks for Profile pages.
-- Dual-write transition: legacy columns remain; this table becomes the
-- authoritative source of truth. Columns can be dropped once all reads migrate.

CREATE TABLE "ProfileBlock" (
  "id"        TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "blockType" TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  "version"   INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileBlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileBlock_profileId_blockType_key"
  ON "ProfileBlock"("profileId", "blockType");

CREATE INDEX "ProfileBlock_profileId_idx"
  ON "ProfileBlock"("profileId");

ALTER TABLE "ProfileBlock"
  ADD CONSTRAINT "ProfileBlock_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "Profile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: copy existing non-null content fields into ProfileBlock rows.
-- One upsert per block type so this is safe to re-run.
INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'about', "aboutContent", NOW()
  FROM "Profile" WHERE "aboutContent" IS NOT NULL AND "aboutContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'journal', "journalContent", NOW()
  FROM "Profile" WHERE "journalContent" IS NOT NULL AND "journalContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'media', "mediaContent", NOW()
  FROM "Profile" WHERE "mediaContent" IS NOT NULL AND "mediaContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'tour', "tourContent", NOW()
  FROM "Profile" WHERE "tourContent" IS NOT NULL AND "tourContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'merch', "merchContent", NOW()
  FROM "Profile" WHERE "merchContent" IS NOT NULL AND "merchContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'request', "requestContent", NOW()
  FROM "Profile" WHERE "requestContent" IS NOT NULL AND "requestContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'recommend', "recommendContent", NOW()
  FROM "Profile" WHERE "recommendContent" IS NOT NULL AND "recommendContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'topfive', "topFiveContent", NOW()
  FROM "Profile" WHERE "topFiveContent" IS NOT NULL AND "topFiveContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'upcoming', "upcomingContent", NOW()
  FROM "Profile" WHERE "upcomingContent" IS NOT NULL AND "upcomingContent" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;

INSERT INTO "ProfileBlock" ("id", "profileId", "blockType", "content", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'prevshows', "previousShowHighlights", NOW()
  FROM "Profile" WHERE "previousShowHighlights" IS NOT NULL AND "previousShowHighlights" <> ''
ON CONFLICT ("profileId", "blockType") DO NOTHING;
