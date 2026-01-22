/*
  Warnings:

  - Made the column `displayName` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "displayName" SET NOT NULL;
