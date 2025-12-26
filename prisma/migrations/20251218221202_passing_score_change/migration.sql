/*
  Warnings:

  - You are about to alter the column `passingScore` on the `Quiz` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,2)` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "passingScore" SET DEFAULT 0,
ALTER COLUMN "passingScore" SET DATA TYPE SMALLINT;
