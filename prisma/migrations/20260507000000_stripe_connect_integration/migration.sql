-- Add Stripe Connect fields for PSP integration

-- Fan: Stripe Customer ID for saving payment methods
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- Artist/Venue/Promoter: Stripe Connect Express account for receiving payouts
ALTER TABLE "Profile" ADD COLUMN "stripeConnectAccountId" TEXT;
ALTER TABLE "Profile" ADD COLUMN "stripeConnectOnboarded" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Profile_stripeConnectAccountId_key" ON "Profile"("stripeConnectAccountId");

-- TicketOrder: Stripe PaymentIntent ID for tracking real charges
ALTER TABLE "TicketOrder" ADD COLUMN "stripePaymentIntentId" TEXT;
CREATE UNIQUE INDEX "TicketOrder_stripePaymentIntentId_key" ON "TicketOrder"("stripePaymentIntentId");
