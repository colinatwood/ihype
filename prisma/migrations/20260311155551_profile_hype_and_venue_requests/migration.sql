-- CreateEnum
CREATE TYPE "ConnectionRequestType" AS ENUM ('LISTENER', 'PROMOTER');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "hypeCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "genres" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Show" ALTER COLUMN "tags" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ProfileHypeEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileHypeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueConnectionRequest" (
    "id" TEXT NOT NULL,
    "venueProfileId" TEXT NOT NULL,
    "artistProfileId" TEXT,
    "requesterId" TEXT NOT NULL,
    "requesterType" "ConnectionRequestType" NOT NULL,
    "artistName" TEXT NOT NULL,
    "note" TEXT,
    "notifyOnBooking" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueConnectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileHypeEvent_userId_profileId_key" ON "ProfileHypeEvent"("userId", "profileId");

-- AddForeignKey
ALTER TABLE "ProfileHypeEvent" ADD CONSTRAINT "ProfileHypeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHypeEvent" ADD CONSTRAINT "ProfileHypeEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueConnectionRequest" ADD CONSTRAINT "VenueConnectionRequest_venueProfileId_fkey" FOREIGN KEY ("venueProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueConnectionRequest" ADD CONSTRAINT "VenueConnectionRequest_artistProfileId_fkey" FOREIGN KEY ("artistProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueConnectionRequest" ADD CONSTRAINT "VenueConnectionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
