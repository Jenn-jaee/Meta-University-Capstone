/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `Mood` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Mood" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantGrowth" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PlantGrowth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlantGrowth_userId_key" ON "PlantGrowth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mood_userId_date_key" ON "Mood"("userId", "date");

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantGrowth" ADD CONSTRAINT "PlantGrowth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
