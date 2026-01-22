/*
  Warnings:

  - Added the required column `position` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "position" INTEGER NOT NULL;
