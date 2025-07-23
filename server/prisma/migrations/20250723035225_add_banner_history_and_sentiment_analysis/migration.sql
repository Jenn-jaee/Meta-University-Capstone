-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "emotionalKeywords" TEXT[],
ADD COLUMN     "sentimentIntensity" DOUBLE PRECISION,
ADD COLUMN     "sentimentScore" DOUBLE PRECISION,
ADD COLUMN     "wordCount" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannerPreferences" JSONB,
ADD COLUMN     "disabledRecommendationTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preferredRecommendationTime" INTEGER;

-- CreateTable
CREATE TABLE "BannerHistory" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bannerType" TEXT,
    "bannerTitle" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BannerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BannerHistory_userId_bannerId_idx" ON "BannerHistory"("userId", "bannerId");

-- CreateIndex
CREATE INDEX "BannerHistory_userId_timestamp_idx" ON "BannerHistory"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "BannerHistory" ADD CONSTRAINT "BannerHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
