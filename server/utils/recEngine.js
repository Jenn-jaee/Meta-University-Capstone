const {
  detectMoodDrop,
  detectLowMood,
  detectStreakReset,
  detectJournalGap,
  detectMoodSwing,
  detectMoodVolatilitySignal,
  detectDistressSignal,
  detectUpliftSignal,
  detectEngagementDrop,
  detectLateNightEntry,
  detectStreakMilestone,
  detectWordUsageInsights,
} = require('./signals');

const {
  calculateBannerScore
} = require('./recommendationScoring');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function evaluateUserSignals(userId) {
  const signalChecks = await Promise.all([
    detectMoodDrop(userId, prisma),
    detectLowMood(userId, prisma),
    detectStreakReset(userId, prisma),
    detectJournalGap(userId, prisma),
    detectMoodSwing(userId, prisma),
    detectMoodVolatilitySignal(userId, prisma),
    detectDistressSignal(userId, prisma),
    detectUpliftSignal(userId, prisma),
    detectEngagementDrop(userId, prisma),
    detectLateNightEntry(userId, prisma),
    detectStreakMilestone(userId, prisma),
    detectWordUsageInsights(userId),
  ]);

  // Filter out nulls and sort by weight descending (priority)
  const validSignals = signalChecks.filter(Boolean).sort((a, b) => b.weight - a.weight);

  return validSignals;
}


async function getDismissalMap(userId) {
  const recentDismissals = await prisma.userBannerHistory.findMany({
    where: {
      userId,
      dismissedAt: { not: null },
    },
    orderBy: { dismissedAt: 'desc' },
  });

  const map = {};

  for (const entry of recentDismissals) {
    const daysAgo = Math.floor(
      (Date.now() - new Date(entry.dismissedAt)) / (1000 * 60 * 60 * 24)
    );

    const tag = entry.bannerTag;
    if (!map[tag] || daysAgo < map[tag]) {
      map[tag] = daysAgo;
    }
  }

  return map;
}

/**
 * Get ranked banners for a user with improved dismissal handling and diversity
 * @param {string} userId - User ID
 * @returns {Array} - Sorted array of banner recommendations
 */
async function getRankedBanners(userId) {
  // Get all potential signals for this user
  const rawSignals = await evaluateUserSignals(userId);

  // If no signals detected, return empty array
  if (!rawSignals.length) return [];

  // Fetch banner history for this user
  const bannerHistory = await prisma.userBannerHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  // Create a map of banner history for quick lookup
  const historyMap = {};
  for (const entry of bannerHistory) {
    historyMap[entry.bannerTag] = {
      daysSinceDismiss: entry.dismissedAt
        ? Math.floor((Date.now() - new Date(entry.dismissedAt)) / (1000 * 60 * 60 * 24))
        : null,
      seenRecently: entry.seenAt
        ? (Date.now() - new Date(entry.seenAt)) / (1000 * 60 * 60) < 6  // seen in last 6 hours
        : false,
      lastSeen: entry.seenAt,
    };
  }

  // Get the most recently shown banner type to avoid showing the same type repeatedly
  let lastShownType = null;
  if (bannerHistory.length > 0) {
    const lastBanner = bannerHistory[0];
    if (lastBanner.bannerTag) {
      lastShownType = lastBanner.bannerTag.split('_')[0];
    }
  }

  // Score each signal
  const scored = rawSignals.map(signal => {
    const history = historyMap[signal.tag] || {};
    const daysSinceDismiss = history.daysSinceDismiss ?? null;
    const seenRecently = history.seenRecently ?? false;
    const signalType = signal.tag.split('_')[0] || 'general';

    // Calculate base score using the normalized scoring system
    let score = calculateBannerScore({
      baseWeight: signal.weight,
      journalWordCount: signal.journalWordCount || 0,
      habitStreak: signal.habitStreak || 0,
      daysSinceDismiss,
    });

    // Apply penalties for recently seen banners
    if (seenRecently) {
      score *= 0.5; // 50% penalty for recently seen banners
    }

    // Promote diversity by penalizing the same type of banner shown last
    if (signalType === lastShownType && !seenRecently) {
      score *= 0.8; // 20% penalty for showing the same type of banner
    }

    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(score, 1.0));

    return {
      tag: signal.tag || 'unknown',
      message: signal.message || '',
      score: parseFloat(score.toFixed(2)),
      // Include additional metadata for debugging
      weight: signal.weight,
      type: signalType,
      daysSinceDismiss,
      seenRecently,
    };
  });

  // Filter out any banners with zero score (completely suppressed)
  const validBanners = scored.filter(banner => banner.score > 0);

  // Sort by score descending
  return validBanners.sort((a, b) => b.score - a.score);
}


module.exports = {
  getRankedBanners,
};
