/*
  Warnings:

  - The values [MONKEY_MEADOW,IN_THE_LOOP] on the enum `BTD6Map` will be removed. If these variants are still used in the database, this will fail.
  - The values [STANDARD,DEFLATION,CHIMPS,APOPALYPSE] on the enum `GameType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BTD6Map_new" AS ENUM ('monkey_meadow', 'in_the_loop');
ALTER TABLE "Challenge" ALTER COLUMN "btd6Maps" TYPE "BTD6Map_new"[] USING ("btd6Maps"::text::"BTD6Map_new"[]);
ALTER TABLE "Submission" ALTER COLUMN "btd6Map" TYPE "BTD6Map_new" USING ("btd6Map"::text::"BTD6Map_new");
ALTER TYPE "BTD6Map" RENAME TO "BTD6Map_old";
ALTER TYPE "BTD6Map_new" RENAME TO "BTD6Map";
DROP TYPE "BTD6Map_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "GameType_new" AS ENUM ('standard', 'deflation', 'chimps', 'apopalypse');
ALTER TABLE "Challenge" ALTER COLUMN "gameTypes" TYPE "GameType_new"[] USING ("gameTypes"::text::"GameType_new"[]);
ALTER TABLE "Submission" ALTER COLUMN "gameType" TYPE "GameType_new" USING ("gameType"::text::"GameType_new");
ALTER TYPE "GameType" RENAME TO "GameType_old";
ALTER TYPE "GameType_new" RENAME TO "GameType";
DROP TYPE "GameType_old";
COMMIT;
