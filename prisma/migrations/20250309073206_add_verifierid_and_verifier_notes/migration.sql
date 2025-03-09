-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "additionalVerifierNotes" TEXT,
ADD COLUMN     "verifierId" TEXT,
ALTER COLUMN "additionalNotes" DROP NOT NULL;
