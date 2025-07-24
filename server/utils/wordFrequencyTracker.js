const { PrismaClient } = require('@prisma/client');
const {
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  STOP_WORDS
} = require('./sentimentWords');

const prisma = new PrismaClient();

function extractWords(text) {
  if (!text) return new Map();

  // Normalize text and split into words
  const normalizedText = text.toLowerCase();
  const words = normalizedText.match(/\b[a-z']+\b/g) || [];

  // Count word frequencies using a Map for O(1) lookups
  const wordCounts = new Map();

  for (const word of words) {
    // Skip stop words and very short words
    if (STOP_WORDS.has(word) || word.length < 3) continue;

    // Increment count for this word
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  return wordCounts;
}


function getSentimentScore(word) {
  if (POSITIVE_WORDS.has(word)) return 0.8;
  if (NEGATIVE_WORDS.has(word)) return -0.8;
  return 0; // Neutral
}

async function updateWordFrequencies(userId, text) {
  const wordCounts = extractWords(text);
  if (wordCounts.size === 0) return { updated: 0, added: 0 };

  let updated = 0;
  let added = 0;

  // Process each word
  for (const [word, count] of wordCounts.entries()) {
    // Calculate sentiment score
    const sentiment = getSentimentScore(word);

    // Use upsert to either update existing record or create new one
    const result = await prisma.userWordFrequency.upsert({
      where: {
        userId_word: {
          userId,
          word,
        },
      },
      update: {
        frequency: { increment: count },
        lastUsed: new Date(),
      },
      create: {
        userId,
        word,
        frequency: count,
        sentiment,
        lastUsed: new Date(),
      },
    });

    if (result.frequency === count) {
      added++;
    } else {
      updated++;
    }
  }

  return { updated, added, total: wordCounts.size };
}


async function getTopWords(userId, limit = 10) {
  return prisma.userWordFrequency.findMany({
    where: { userId },
    orderBy: { frequency: 'desc' },
    take: limit,
    select: {
      word: true,
      frequency: true,
      sentiment: true,
      lastUsed: true,
    },
  });
}

async function getUserSentimentProfile(userId) {
  // Get all words with sentiment scores
  const words = await prisma.userWordFrequency.findMany({
    where: {
      userId,
      sentiment: { not: 0 }
    },
    orderBy: { frequency: 'desc' },
  });

  if (words.length === 0) {
    return {
      score: 0,
      topPositive: [],
      topNegative: [],
      totalWords: 0
    };
  }

  // Calculate weighted sentiment score
  let totalWeight = 0;
  let weightedSum = 0;

  for (const word of words) {
    const weight = word.frequency;
    totalWeight += weight;
    weightedSum += weight * (word.sentiment || 0);
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Get top positive and negative words
  const positiveWords = words
    .filter(w => (w.sentiment || 0) > 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const negativeWords = words
    .filter(w => (w.sentiment || 0) < 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  return {
    score: parseFloat(score.toFixed(2)),
    topPositive: positiveWords.map(w => ({ word: w.word, frequency: w.frequency })),
    topNegative: negativeWords.map(w => ({ word: w.word, frequency: w.frequency })),
    totalWords: words.length
  };
}

module.exports = {
  updateWordFrequencies,
  getTopWords,
  getUserSentimentProfile,
  extractWords,
};
