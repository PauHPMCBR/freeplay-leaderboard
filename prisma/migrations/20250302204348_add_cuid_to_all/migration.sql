/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `BTD6Map` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `GameType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `BTD6Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `GameType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BTD6Map" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameType" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BTD6Map_code_key" ON "BTD6Map"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GameType_code_key" ON "GameType"("code");
