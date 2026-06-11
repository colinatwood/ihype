-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "pageDraft" TEXT;
ALTER TABLE "Profile" ADD COLUMN "pageDraftUpdatedAt" TIMESTAMP(3);
ALTER TABLE "Profile" ADD COLUMN "pagePublished" TEXT;
ALTER TABLE "Profile" ADD COLUMN "pagePublishedAt" TIMESTAMP(3);
