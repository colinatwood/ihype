-- Add beta support intake records for login, verification, takedown, ticket, and general help workflows.
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "requesterUserId" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "subject" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupportRequest_status_createdAt_idx" ON "SupportRequest"("status", "createdAt");
CREATE INDEX "SupportRequest_type_createdAt_idx" ON "SupportRequest"("type", "createdAt");
CREATE INDEX "SupportRequest_requesterUserId_createdAt_idx" ON "SupportRequest"("requesterUserId", "createdAt");
