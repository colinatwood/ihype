-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "songUploadCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "ticketsSoldCount" INTEGER NOT NULL DEFAULT 0;
