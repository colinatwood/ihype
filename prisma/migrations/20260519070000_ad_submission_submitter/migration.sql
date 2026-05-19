-- AlterTable
ALTER TABLE "AdSubmission" ADD COLUMN "submitterUserId" TEXT;

-- CreateIndex
CREATE INDEX "AdSubmission_submitterUserId_idx" ON "AdSubmission"("submitterUserId");

-- AddForeignKey
ALTER TABLE "AdSubmission" ADD CONSTRAINT "AdSubmission_submitterUserId_fkey" FOREIGN KEY ("submitterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
