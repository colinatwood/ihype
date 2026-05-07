-- Add reassignCount to Ticket to track how many times a ticket has changed hands
ALTER TABLE "Ticket" ADD COLUMN "reassignCount" INTEGER NOT NULL DEFAULT 0;
