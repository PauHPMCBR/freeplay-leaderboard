/*
  Warnings:

  - Added the required column `additionalNotes` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heroId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "additionalNotes" TEXT NOT NULL,
ADD COLUMN     "heroId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hero_code_key" ON "Hero"("code");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
