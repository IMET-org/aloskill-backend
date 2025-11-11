/*
  Warnings:

  - The values [ONLINE,OFFLINE] on the enum `CourseType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ASSIGNMENT] on the enum `TeachingApproach` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `language` on the `InstructorProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `bio` on table `InstructorProfile` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `proposedCourseCategory` on the `InstructorProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `platform` on the `SocialLink` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('BUSINESS', 'MARKETING', 'ENTREPRENEURSHIP', 'ICT');

-- CreateEnum
CREATE TYPE "TeachingLanguage" AS ENUM ('ENGLISH', 'BANGLA');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEdIN', 'YOUTUBE');

-- AlterEnum
ALTER TYPE "CourseLevel" ADD VALUE 'EXPERT';

-- AlterEnum
BEGIN;
CREATE TYPE "CourseType_new" AS ENUM ('LIVE', 'PRE_RECORDED', 'HYBRID', 'SELF_STUDY');
ALTER TABLE "InstructorProfile" ALTER COLUMN "courseType" TYPE "CourseType_new" USING ("courseType"::text::"CourseType_new");
ALTER TYPE "CourseType" RENAME TO "CourseType_old";
ALTER TYPE "CourseType_new" RENAME TO "CourseType";
DROP TYPE "public"."CourseType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TeachingApproach_new" AS ENUM ('INTERACTIVE', 'VIDEO', 'LIVE', 'PROJECT_BASED');
ALTER TABLE "InstructorProfile" ALTER COLUMN "prevTeachingApproach" TYPE "TeachingApproach_new" USING ("prevTeachingApproach"::text::"TeachingApproach_new");
ALTER TYPE "TeachingApproach" RENAME TO "TeachingApproach_old";
ALTER TYPE "TeachingApproach_new" RENAME TO "TeachingApproach";
DROP TYPE "public"."TeachingApproach_old";
COMMIT;

-- AlterTable
ALTER TABLE "InstructorProfile" DROP COLUMN "language",
ADD COLUMN     "language" "TeachingLanguage" NOT NULL,
ALTER COLUMN "bio" SET NOT NULL,
DROP COLUMN "proposedCourseCategory",
ADD COLUMN     "proposedCourseCategory" "CourseCategory" NOT NULL;

-- AlterTable
ALTER TABLE "SocialLink" DROP COLUMN "platform",
ADD COLUMN     "platform" "SocialPlatform" NOT NULL;
