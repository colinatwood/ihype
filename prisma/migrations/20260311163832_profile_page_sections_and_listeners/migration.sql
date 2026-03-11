-- AlterEnum
ALTER TYPE "ProfileType" ADD VALUE 'LISTENER';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "recommendContent" TEXT,
ADD COLUMN     "requestContent" TEXT,
ADD COLUMN     "topFiveContent" TEXT;
