/*
  Warnings:

  - A unique constraint covering the columns `[lessonId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Made the column `lessonId` on table `Quiz` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "lessonId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");
