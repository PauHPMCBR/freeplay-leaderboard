/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `difficulty` to the `BTD6Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `GameType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BTD6Map" ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameType" ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "players" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "seed" INTEGER,
ADD COLUMN     "version" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifier" BOOLEAN NOT NULL DEFAULT false;
