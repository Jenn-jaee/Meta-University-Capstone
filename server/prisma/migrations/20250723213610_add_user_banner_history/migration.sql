/*
  Warnings:

  - You are about to drop the column `action` on the `UserBannerHistory` table. All the data in the column will be lost.
  - You are about to drop the column `bannerId` on the `UserBannerHistory` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `UserBannerHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,bannerTag]` on the table `UserBannerHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bannerTag` to the `UserBannerHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserBannerHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBannerHistory" DROP COLUMN "action",
DROP COLUMN "bannerId",
DROP COLUMN "timestamp",
ADD COLUMN     "bannerTag" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dismissedAt" TIMESTAMP(3),
ADD COLUMN     "seenAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserBannerHistory_userId_bannerTag_key" ON "UserBannerHistory"("userId", "bannerTag");
