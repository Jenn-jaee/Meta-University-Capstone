function boostFromWordCount(wordCount = 0) {
  // Logarithmic scale that plateaus at 100 words
  // Maps: 0 words → 0, 50 words → 0.075, 100+ words → 0.15
  if (wordCount === 0) return 0;

  const maxBoost = 0.15;
  const scaleFactor = 100; // Words needed for max boost

  // Logarithmic function that grows quickly at first, then plateaus
  const normalizedCount = Math.min(wordCount, scaleFactor) / scaleFactor;
  const boost = maxBoost * (Math.log10(1 + 9 * normalizedCount) / Math.log10(10));

  return parseFloat(boost.toFixed(3));
}


function boostFromHabitStreak(daysStreaked = 0) {
  // Sigmoid function that plateaus at 10 days
  // Maps: 0 days → 0, 3 days → 0.075, 7+ days → 0.15
  if (daysStreaked === 0) return 0;

  const maxBoost = 0.15;
  const midPoint = 5; // Days at which we reach half of max boost
  const steepness = 0.5; // Controls how quickly the function rises

  // Sigmoid function: maxBoost / (1 + e^(-steepness * (x - midPoint)))
  const boost = maxBoost / (1 + Math.exp(-steepness * (daysStreaked - midPoint)));

  return parseFloat(boost.toFixed(3));
}

function applyDismissPenalty(baseScore, daysSinceDismiss = 0) {
  // Complete suppression for first 3 days
  if (daysSinceDismiss < 3) return 0;

  // For days 3-7, use exponential recovery curve
  // Formula: 1 - e^(-k * (x - offset))
  // where k controls recovery speed and offset is the suppression period
  const recoveryDays = daysSinceDismiss - 3; // Days since suppression ended
  const maxRecoveryDays = 4; // Full recovery after suppression + 4 days
  const recoveryRate = 0.8; // Controls recovery speed

  // Calculate recovery percentage (0 to 1)
  const recoveryPercentage = Math.min(
    1.0,
    1.0 - Math.exp(-recoveryRate * recoveryDays / maxRecoveryDays)
  );

  return baseScore * recoveryPercentage;
}


function calculateBannerScore({
  baseWeight = 1,
  journalWordCount = 0,
  habitStreak = 0,
  daysSinceDismiss = null,
}) {
  // Normalize base weight to 0-0.7 scale (assuming weights are 1-5)
  const normalizedBaseWeight = Math.min(baseWeight / 5 * 0.7, 0.7);

  // Calculate score components
  let score = normalizedBaseWeight;
  score += boostFromWordCount(journalWordCount);
  score += boostFromHabitStreak(habitStreak);

  // Apply dismissal penalty if applicable
  if (daysSinceDismiss !== null) {
    score = applyDismissPenalty(score, daysSinceDismiss);
  }

  // Ensure score doesn't exceed 1.0
  score = Math.min(score, 1.0);

  return parseFloat(score.toFixed(2));
}

module.exports = {
  calculateBannerScore,
  boostFromWordCount,
  boostFromHabitStreak,
  applyDismissPenalty,
};
