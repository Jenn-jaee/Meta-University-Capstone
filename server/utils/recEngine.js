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
  ]);

  // Filter out nulls and sort by weight descending (priority)
  const validSignals = signalChecks.filter(Boolean).sort((a, b) => b.weight - a.weight);

  return validSignals;
}


async function getDismissalMap(userId) {
  const recentDismissals = await prisma.userBannerHistory.findMany({
    where: {
      userId,
      action: 'dismissed',
    },
    orderBy: { timestamp: 'desc' },
  });

  const map = {};

  for (const entry of recentDismissals) {
    const daysAgo = Math.floor(
      (Date.now() - new Date(entry.timestamp)) / (1000 * 60 * 60 * 24)
    );

    const tag = entry.bannerId; // bannerId should match signal.tag
    if (!map[tag] || daysAgo < map[tag]) {
      map[tag] = daysAgo;
    }
  }

  return map;
}

async function getRankedBanners(userId) {
  const rawSignals = await evaluateUserSignals(userId);

  // Fetch seen/dismissed state for all banner tags
  const bannerHistory = await prisma.userBannerHistory.findMany({
    where: { userId },
  });

  const historyMap = {};
  for (const entry of bannerHistory) {
    historyMap[entry.bannerTag] = {
      daysSinceDismiss: entry.dismissedAt
        ? Math.floor((Date.now() - new Date(entry.dismissedAt)) / (1000 * 60 * 60 * 24))
        : null,
      seenRecently: entry.seenAt
        ? (Date.now() - new Date(entry.seenAt)) / (1000 * 60 * 60) < 12  // seen in last 12 hours
        : false,
    };
  }

  const scored = rawSignals.map(signal => {
    const history = historyMap[signal.tag] || {};
    const daysSinceDismiss = history.daysSinceDismiss ?? null;
    const seenRecently = history.seenRecently ?? false;

    let score = calculateBannerScore({
      baseWeight: signal.weight,
      journalWordCount: signal.journalWordCount || 0,
      habitStreak: signal.habitStreak || 0,
      daysSinceDismiss,
    });

    // Optional: penalize banners recently seen but not dismissed
    if (seenRecently) {
      score *= 0.8; // 20% penalty
    }

    return {
      tag: signal.tag || 'unknown',
      message: signal.message || '',
      score: parseFloat(score.toFixed(2)),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}


module.exports = {
  getRankedBanners,
};
