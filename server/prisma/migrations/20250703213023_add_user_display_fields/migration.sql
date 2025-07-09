-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "hasSeenWelcome" BOOLEAN NOT NULL DEFAULT false;
