
const positiveWords = [
  'happy', 'joy', 'excited', 'great', 'good', 'wonderful', 'amazing',
  'fantastic', 'pleased', 'delighted', 'grateful', 'thankful', 'love',
  'enjoy', 'positive', 'optimistic', 'hopeful', 'confident', 'proud'
];

const negativeWords = [
  'sad', 'angry', 'upset', 'frustrated', 'disappointed', 'worried',
  'anxious', 'stressed', 'depressed', 'unhappy', 'miserable', 'hate',
  'terrible', 'awful', 'bad', 'negative', 'pessimistic', 'hopeless'
];

const intensityWords = [
  'very', 'extremely', 'incredibly', 'really', 'so', 'absolutely',
  'completely', 'totally', 'utterly', 'deeply', 'profoundly'
];

/**
 * Utility to count matches of word list in a given array of words
 */
function countWordMatches(words, wordList) {
  let count = 0;
  const found = new Set();

  for (const word of words) {
    if (wordList.includes(word)) {
      count++;
      found.add(word);
    }
  }

  return { count, found };
}

/**
 * Main text sentiment analysis
 */
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

/**
 * Checks if a journal entry is distressing
 */
function isDistressed(text) {
  const { score, keywords } = analyzeText(text);
  const distressKeywords = [
    'sad', 'angry', 'depressed', 'hopeless', 'miserable',
    'stressed', 'unhappy', 'anxious', 'frustrated'
  ];

  return (
    score < -0.5 ||
    distressKeywords.some(word => keywords.includes(word))
  );
}

/**
 * Checks if a journal entry is highly positive
 */
function isPositive(text) {
  const { score, keywords } = analyzeText(text);
  const upliftKeywords = [
    'grateful', 'thankful', 'joy', 'hopeful',
    'optimistic', 'proud', 'confident', 'happy'
  ];

  return (
    score > 0.5 &&
    upliftKeywords.some(word => keywords.includes(word))
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
