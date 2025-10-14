/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropIndex
DROP INDEX "public"."UserSession_refreshToken_idx";

-- DropIndex
DROP INDEX "public"."UserSession_refreshToken_key";

-- DropIndex
DROP INDEX "public"."UserSession_sessionToken_idx";

-- DropIndex
DROP INDEX "public"."refresh_tokens_userId_idx";

-- AlterTable
ALTER TABLE "public"."UserSession" DROP COLUMN "refreshToken";

-- AlterTable
ALTER TABLE "public"."refresh_tokens" DROP COLUMN "deviceId",
DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
DROP COLUMN "userId",
ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "refresh_tokens_sessionId_idx" ON "public"."refresh_tokens"("sessionId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
