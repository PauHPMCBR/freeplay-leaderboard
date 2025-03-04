/*
  Warnings:

  - You are about to drop the column `maps` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `map` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `btd6Map` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Submission_map_gameType_highestRound_idx";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "maps",
ADD COLUMN     "btd6Maps" "BTD6Map"[];

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "map",
ADD COLUMN     "btd6Map" "BTD6Map" NOT NULL;

-- CreateIndex
CREATE INDEX "Submission_btd6Map_gameType_highestRound_idx" ON "Submission"("btd6Map", "gameType", "highestRound");
