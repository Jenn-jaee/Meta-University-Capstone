/*
  Warnings:

  - You are about to drop the column `journalEntryId` on the `Mood` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[moodId]` on the table `JournalEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Mood" DROP CONSTRAINT "Mood_journalEntryId_fkey";

-- DropIndex
DROP INDEX "Habit_userId_idx";

-- DropIndex
DROP INDEX "JournalEntry_userId_idx";

-- DropIndex
DROP INDEX "Mood_journalEntryId_key";

-- DropIndex
DROP INDEX "Mood_userId_idx";

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "moodId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Entry';

-- AlterTable
ALTER TABLE "Mood" DROP COLUMN "journalEntryId";

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_moodId_key" ON "JournalEntry"("moodId");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "Mood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
