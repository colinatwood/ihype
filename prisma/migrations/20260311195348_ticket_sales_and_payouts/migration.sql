-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "artistPayoutPercent" INTEGER,
ADD COLUMN     "isTicketed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promoterPayoutPercent" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "promoterProfileId" TEXT,
ADD COLUMN     "ticketCapacity" INTEGER,
ADD COLUMN     "ticketPriceCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "venuePayoutPercent" INTEGER;

-- CreateTable
CREATE TABLE "TicketOrder" (
    "id" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "venuePayoutCents" INTEGER NOT NULL,
    "artistPayoutCents" INTEGER NOT NULL,
    "promoterPayoutCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketOrder_confirmationCode_key" ON "TicketOrder"("confirmationCode");

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_promoterProfileId_fkey" FOREIGN KEY ("promoterProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketOrder" ADD CONSTRAINT "TicketOrder_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
