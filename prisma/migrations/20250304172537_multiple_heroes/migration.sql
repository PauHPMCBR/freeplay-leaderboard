/*
  Warnings:

  - You are about to drop the column `heroId` on the `Submission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_heroId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "heroId";

-- CreateTable
CREATE TABLE "_SubmissionHeroes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubmissionHeroes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SubmissionHeroes_B_index" ON "_SubmissionHeroes"("B");

-- AddForeignKey
ALTER TABLE "_SubmissionHeroes" ADD CONSTRAINT "_SubmissionHeroes_A_fkey" FOREIGN KEY ("A") REFERENCES "Hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmissionHeroes" ADD CONSTRAINT "_SubmissionHeroes_B_fkey" FOREIGN KEY ("B") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
