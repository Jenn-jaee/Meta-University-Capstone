/*
  Warnings:

  - You are about to drop the column `moodId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dailyReminders` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privateJournal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `themePreference` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Mood` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_moodId_fkey";

-- DropForeignKey
ALTER TABLE "Mood" DROP CONSTRAINT "Mood_userId_fkey";

-- DropIndex
DROP INDEX "JournalEntry_moodId_key";

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "moodId",
ADD COLUMN     "journalMood" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
DROP COLUMN "dailyReminders",
DROP COLUMN "privateJournal",
DROP COLUMN "themePreference";

-- DropTable
DROP TABLE "Mood";
