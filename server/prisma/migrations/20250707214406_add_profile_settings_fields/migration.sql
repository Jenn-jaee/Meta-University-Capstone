-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "dailyReminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privateJournal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "themePreference" TEXT;
