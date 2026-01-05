-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_id_deletedAt_status_idx" ON "User"("id", "deletedAt", "status");
