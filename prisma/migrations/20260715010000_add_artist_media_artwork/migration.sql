-- Optional cover-art URL for an uploaded track/crate item (DESIGN_SYNC row
-- 83). Mirrors the existing Profile.avatarImage/heroImage pattern: a plain
-- URL string, populated via the same object-storage abstraction
-- (src/lib/object-storage.ts) used for profile graphics, not a separate
-- storage-provider/key pair like ArtistMediaAsset's own audio fields —
-- cover art is a small image, not something that needs base64-in-DB
-- fallback tracked separately.
ALTER TABLE "ArtistMediaAsset" ADD COLUMN "artworkUrl" TEXT;
