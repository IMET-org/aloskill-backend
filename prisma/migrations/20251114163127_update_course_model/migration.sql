/*
  Warnings:

  - The `language` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `shortDesc` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'BANGLA');

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "shortDesc" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'BANGLA';

-- CreateIndex
CREATE INDEX "InstructorProfile_userId_status_deletedAt_idx" ON "InstructorProfile"("userId", "status", "deletedAt");
