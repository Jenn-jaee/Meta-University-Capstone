
function boostFromWordCount(wordCount = 0) {
  if (wordCount >= 100) return 0.5;
  if (wordCount >= 50) return 0.25;
  return 0;
}

function boostFromHabitStreak(daysStreaked = 0) {
  if (daysStreaked >= 7) return 0.5;
  if (daysStreaked >= 3) return 0.3;
  return 0;
}

// NEW 2-day cooldown logic:
// - Day 0–1: heavy penalty
// - Day 2: fully recovered
function applyDismissPenalty(baseScore, daysSinceDismiss = 0) {
  if (daysSinceDismiss < 1) return baseScore * 0.1;
  if (daysSinceDismiss < 2) return baseScore * 0.4;
  return baseScore; // fully recovered after 2 days
}

function calculateBannerScore({
  baseWeight = 1,
  journalWordCount = 0,
  habitStreak = 0,
  daysSinceDismiss = null,
}) {
  let score = baseWeight;

  score += boostFromWordCount(journalWordCount);
  score += boostFromHabitStreak(habitStreak);

  if (daysSinceDismiss !== null) {
    score = applyDismissPenalty(score, daysSinceDismiss);
  }

  return parseFloat(score.toFixed(2));
}

module.exports = {
  calculateBannerScore,
  boostFromWordCount,
  boostFromHabitStreak,
  applyDismissPenalty,
};
