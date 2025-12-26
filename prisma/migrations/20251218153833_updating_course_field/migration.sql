-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "congratulationsMessage" TEXT,
ADD COLUMN     "welcomeMessage" TEXT;

-- CreateIndex
CREATE INDEX "InstructorProfile_displayName_status_deletedAt_idx" ON "InstructorProfile"("displayName", "status", "deletedAt");
