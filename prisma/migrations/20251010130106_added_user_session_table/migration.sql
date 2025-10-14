/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[replacedByTokenId]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'SMART_TV', 'GAME_CONSOLE', 'UNKNOWN');

-- DropIndex
DROP INDEX "public"."refresh_tokens_token_idx";

-- DropIndex
DROP INDEX "public"."refresh_tokens_userId_userAgent_ipAddress_key";

-- AlterTable
ALTER TABLE "public"."refresh_tokens" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "replacedByTokenId" TEXT,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "sessionToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "deviceType" "public"."DeviceType" NOT NULL,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "platform" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "timezone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCompromised" BOOLEAN NOT NULL DEFAULT false,
    "compromisedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON "public"."UserSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "public"."UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "public"."UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_deviceId_idx" ON "public"."UserSession"("deviceId");

-- CreateIndex
CREATE INDEX "UserSession_sessionToken_idx" ON "public"."UserSession"("sessionToken");

-- CreateIndex
CREATE INDEX "UserSession_refreshToken_idx" ON "public"."UserSession"("refreshToken");

-- CreateIndex
CREATE INDEX "UserSession_isActive_idx" ON "public"."UserSession"("isActive");

-- CreateIndex
CREATE INDEX "UserSession_lastActivity_idx" ON "public"."UserSession"("lastActivity");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "public"."UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "UserSession_isCompromised_idx" ON "public"."UserSession"("isCompromised");

-- CreateIndex
CREATE INDEX "UserSession_createdAt_idx" ON "public"."UserSession"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_deviceId_key" ON "public"."UserSession"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_replacedByTokenId_key" ON "public"."refresh_tokens"("replacedByTokenId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_revoked_idx" ON "public"."refresh_tokens"("revoked");

-- CreateIndex
CREATE INDEX "refresh_tokens_revokedAt_idx" ON "public"."refresh_tokens"("revokedAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_replacedByTokenId_idx" ON "public"."refresh_tokens"("replacedByTokenId");

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_replacedByTokenId_fkey" FOREIGN KEY ("replacedByTokenId") REFERENCES "public"."refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
