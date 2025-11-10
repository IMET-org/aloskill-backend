/*
  Warnings:

  - You are about to drop the column `canBeDeleted` on the `InstructorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `courseInfo` on the `InstructorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `InstructorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `InstructorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `proposedCourse` on the `InstructorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `proposedPrice` on the `InstructorProfile` table. All the data in the column will be lost.
  - You are about to alter the column `city` on the `InstructorProfile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - You are about to alter the column `experience` on the `InstructorProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `SmallInt`.
  - Added the required column `proposedCourseCategory` to the `InstructorProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalRefunds` on table `InstructorProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "public"."InstructorProfile_isVerified_idx";

-- AlterTable
ALTER TABLE "InstructorProfile" DROP COLUMN "canBeDeleted",
DROP COLUMN "courseInfo",
DROP COLUMN "duration",
DROP COLUMN "isVerified",
DROP COLUMN "proposedCourse",
DROP COLUMN "proposedPrice",
ADD COLUMN     "proposedCourseCategory" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "city" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "experience" SET DEFAULT 0,
ALTER COLUMN "experience" SET DATA TYPE SMALLINT,
ALTER COLUMN "totalRefunds" SET NOT NULL;

-- CreateIndex
CREATE INDEX "InstructorProfile_status_idx" ON "InstructorProfile"("status");
