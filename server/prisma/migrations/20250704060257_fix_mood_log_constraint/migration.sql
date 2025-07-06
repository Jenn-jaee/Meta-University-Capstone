-- DropIndex
DROP INDEX "MoodLog_userId_createdAt_key";

-- CreateIndex
CREATE INDEX "MoodLog_userId_createdAt_idx" ON "MoodLog"("userId", "createdAt");
