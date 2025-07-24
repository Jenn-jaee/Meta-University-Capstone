const {
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  INTENSITY_WORDS,
  DISTRESS_WORDS,
  UPLIFT_WORDS
} = require('./sentimentWords');

// Convert Sets to Arrays for backward compatibility with existing code
const positiveWords = Array.from(POSITIVE_WORDS);
const negativeWords = Array.from(NEGATIVE_WORDS);
const intensityWords = Array.from(INTENSITY_WORDS);

/**
 * Utility to count matches of word list in a given array of words
 * Optimized version using Set for O(1) lookups
 */
function countWordMatches(words, wordList) {
  // Convert wordList to a Set for O(1) lookups if it's not already a Set
  const wordSet = wordList instanceof Set ? wordList : new Set(wordList);

  // Convert words to a Set to eliminate duplicates
  const uniqueWords = new Set(words);

  // Find intersection between uniqueWords and wordSet
  const intersection = new Set([...uniqueWords].filter(word => wordSet.has(word)));

  return {
    count: intersection.size,
    found: intersection
  };
}

// Main text sentiment analysis

function analyzeText(text) {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\W+/);

  const { count: positiveCount, found: positiveMatches } = countWordMatches(words, positiveWords);
  const { count: negativeCount, found: negativeMatches } = countWordMatches(words, negativeWords);
  const { count: intensityCount } = countWordMatches(words, intensityWords);

  const totalEmotionalWords = positiveCount + negativeCount;
  const allFoundKeywords = new Set([...positiveMatches, ...negativeMatches]);

  let score = 0;
  if (totalEmotionalWords > 0) {
    score = (positiveCount - negativeCount) / totalEmotionalWords;
  }

  const intensity = Math.min(
    (totalEmotionalWords / words.length) + (intensityCount / words.length),
    1
  );

  return {
    score,
    intensity,
    keywords: Array.from(allFoundKeywords)
  };
}

// Checks if a journal entry is distressing
function isDistressed(text) {
  const { score, keywords } = analyzeText(text);
  const distressKeywordsArray = Array.from(DISTRESS_WORDS);

  return (
    score < -0.5 ||
    distressKeywordsArray.some(word => keywords.includes(word))
  );
}

// Checks if a journal entry is highly positive
function isPositive(text) {
  const { score, keywords } = analyzeText(text);
  const upliftKeywordsArray = Array.from(UPLIFT_WORDS);

  return (
    score > 0.5 &&
    upliftKeywordsArray.some(word => keywords.includes(word))
  );
}

module.exports = {
  analyzeText,
  isDistressed,
  isPositive,
  positiveWords,
  negativeWords,
  intensityWords
};
