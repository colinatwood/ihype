-- CreateEnum
CREATE TYPE "ConnectionRequestStatus" AS ENUM ('PENDING', 'BOOKED', 'DISMISSED');

-- AlterTable
ALTER TABLE "VenueConnectionRequest" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ConnectionRequestStatus" NOT NULL DEFAULT 'PENDING';
