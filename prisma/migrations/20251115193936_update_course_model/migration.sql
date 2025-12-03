/*
  Warnings:

  - You are about to drop the column `shortDesc` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "shortDesc",
ADD COLUMN     "level" "CourseLevel" NOT NULL DEFAULT 'BEGINNER';
