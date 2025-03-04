/*
  Warnings:

  - You are about to drop the column `btd6Maps` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `gameTypes` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `btd6Map` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `gameType` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `btd6MapId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameTypeId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Submission_btd6Map_gameType_highestRound_idx";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "btd6Maps",
DROP COLUMN "gameTypes";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "btd6Map",
DROP COLUMN "gameType",
ADD COLUMN     "btd6MapId" TEXT NOT NULL,
ADD COLUMN     "gameTypeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BTD6Map";

-- DropEnum
DROP TYPE "GameType";

-- CreateTable
CREATE TABLE "BTD6Map" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BTD6Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GameType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BTD6MapToChallenge" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BTD6MapToChallenge_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChallengeToGameType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChallengeToGameType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BTD6MapToChallenge_B_index" ON "_BTD6MapToChallenge"("B");

-- CreateIndex
CREATE INDEX "_ChallengeToGameType_B_index" ON "_ChallengeToGameType"("B");

-- CreateIndex
CREATE INDEX "Submission_btd6MapId_gameTypeId_highestRound_idx" ON "Submission"("btd6MapId", "gameTypeId", "highestRound");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_btd6MapId_fkey" FOREIGN KEY ("btd6MapId") REFERENCES "BTD6Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "GameType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BTD6MapToChallenge" ADD CONSTRAINT "_BTD6MapToChallenge_A_fkey" FOREIGN KEY ("A") REFERENCES "BTD6Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BTD6MapToChallenge" ADD CONSTRAINT "_BTD6MapToChallenge_B_fkey" FOREIGN KEY ("B") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToGameType" ADD CONSTRAINT "_ChallengeToGameType_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToGameType" ADD CONSTRAINT "_ChallengeToGameType_B_fkey" FOREIGN KEY ("B") REFERENCES "GameType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
