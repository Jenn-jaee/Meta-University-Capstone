-- CreateTable
CREATE TABLE "UserWordFrequency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentiment" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWordFrequency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserWordFrequency_userId_frequency_idx" ON "UserWordFrequency"("userId", "frequency" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "UserWordFrequency_userId_word_key" ON "UserWordFrequency"("userId", "word");

-- AddForeignKey
ALTER TABLE "UserWordFrequency" ADD CONSTRAINT "UserWordFrequency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
