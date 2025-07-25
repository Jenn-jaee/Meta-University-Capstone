/*
  Warnings:

  - You are about to drop the column `emotionalKeywords` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `sentimentIntensity` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `sentimentScore` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `wordCount` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `bannerPreferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `disabledRecommendationTypes` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredRecommendationTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BannerHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BannerHistory" DROP CONSTRAINT "BannerHistory_userId_fkey";

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "emotionalKeywords",
DROP COLUMN "sentimentIntensity",
DROP COLUMN "sentimentScore",
DROP COLUMN "wordCount";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bannerPreferences",
DROP COLUMN "disabledRecommendationTypes",
DROP COLUMN "preferredRecommendationTime";

-- DropTable
DROP TABLE "BannerHistory";

-- CreateTable
CREATE TABLE "UserBannerHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBannerHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBannerHistory" ADD CONSTRAINT "UserBannerHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
