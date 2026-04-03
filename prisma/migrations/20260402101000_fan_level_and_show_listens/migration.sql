-- Add completion tracking for full song listens.
ALTER TABLE "MediaListen"
ADD COLUMN "completedAt" TIMESTAMP(3);

-- Track completed full-show listens for fan-level calculation.
CREATE TABLE "ShowListen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "showSlug" TEXT NOT NULL,
    "playbackUrl" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowListen_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShowListen_userId_showId_key" ON "ShowListen"("userId", "showId");

ALTER TABLE "ShowListen"
ADD CONSTRAINT "ShowListen_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShowListen"
ADD CONSTRAINT "ShowListen_showId_fkey"
FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
