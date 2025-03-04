/*
  Warnings:

  - The `maps` column on the `Challenge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `map` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BTD6Map" AS ENUM ('MONKEY_MEADOW', 'IN_THE_LOOP');

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "maps",
ADD COLUMN     "maps" "BTD6Map"[];

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "map",
ADD COLUMN     "map" "BTD6Map" NOT NULL;

-- DropEnum
DROP TYPE "Map";

-- CreateIndex
CREATE INDEX "Submission_map_gameType_highestRound_idx" ON "Submission"("map", "gameType", "highestRound");
