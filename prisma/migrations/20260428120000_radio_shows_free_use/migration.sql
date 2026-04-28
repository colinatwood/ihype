-- AlterTable: add freeUseEnabled to ArtistMediaAsset
ALTER TABLE "ArtistMediaAsset" ADD COLUMN "freeUseEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: add isRadioShow to Show
ALTER TABLE "Show" ADD COLUMN "isRadioShow" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: freeUseEnabled for fast free-use catalogue queries
CREATE INDEX "ArtistMediaAsset_freeUseEnabled_createdAt_idx" ON "ArtistMediaAsset"("freeUseEnabled", "createdAt");
