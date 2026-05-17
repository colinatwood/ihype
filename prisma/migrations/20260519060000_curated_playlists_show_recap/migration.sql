-- AlterTable: add recapText to Show
ALTER TABLE "Show" ADD COLUMN "recapText" TEXT;

-- CreateTable: CuratedPlaylist
CREATE TABLE "CuratedPlaylist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "tracks" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CuratedPlaylist_published_createdAt_idx" ON "CuratedPlaylist"("published", "createdAt");
