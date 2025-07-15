const { PrismaClient } = require('@prisma/client');
const { calculateStreak, getUniqueDays } = require('./recommendationUtils');

const prisma = new PrismaClient();

// Finite-State Recommendation Engine
// Pull the last 14 days of mood + journal data for a user
// Derive the user's current engagement state
// Return a tailored recommendation banner message

// Fetch mood logs & journal entries for the past N days
async function fetchRecentLogs(userId, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));

  const [moodLogs, journals] = await Promise.all([
    prisma.moodLog.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.journalEntry.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  return { moodLogs, journals };
}



// Main entry point - returns an object the front-end can render
async function getRecommendation(userId) {
  // Pull recent logs
  const { moodLogs, journals } = await fetchRecentLogs(userId);

  // Combine & analyze
  const combined = [...moodLogs, ...journals];
  const streak = calculateStreak(combined);
  const activeDays = getUniqueDays(combined).length;

  // Build recommendation based on engagement patterns
  const required = 9; // 65% of 14 days
  const totalLogs = combined.length;
  const logsRemaining = Math.max(required - totalLogs, 0);

  // Check recent activity (last 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentLogs = combined.filter(log => new Date(log.createdAt) >= threeDaysAgo);
  const hasRecentActivity = recentLogs.length > 0;

  // Check if user has been active in the last week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyLogs = combined.filter(log => new Date(log.createdAt) >= oneWeekAgo);
  const weeklyActivity = weeklyLogs.length;

  let banner;

  // Prioritize based on engagement patterns, not just total count
  if (streak >= 7) {
    // High streak - celebrate consistency
    banner = {
      title: `🔥 Amazing ${streak}-day streak!`,
      description: 'Your consistency is paying off! Keep the momentum going.',
      type: 'celebrate',
    };
  } else if (streak >= 3) {
    // Building momentum
    banner = {
      title: `💪 Great ${streak}-day streak!`,
      description: `You're building great habits. Reach 7 days for a special milestone!`,
      type: 'success',
    };
  } else if (hasRecentActivity && totalLogs >= required) {
    // Recently active and meets threshold
    banner = {
      title: '🌳 Your effort is paying off!',
      description: `You've been active with ${activeDays} days of engagement. Your plant is thriving!`,
      type: 'celebrate',
    };
  } else if (hasRecentActivity && logsRemaining <= 3) {
    // Recently active, close to goal
    banner = {
      title: `🚀 Almost there – just ${logsRemaining} more!`,
      description: 'You\'re so close to your growth goal. Keep it up!',
      type: 'success',
    };
  } else if (hasRecentActivity) {
    // Recently active but needs more
    banner = {
      title: 'Keep the momentum going!',
      description: `${logsRemaining} more check-ins needed to reach your growth goal.`,
      type: 'info',
    };
  } else if (weeklyActivity > 0) {
    // Some weekly activity but not recent
    banner = {
      title: '✨ Ready to get back on track?',
      description: 'You\'ve been making progress. Log your mood or add a journal entry today!',
      type: 'prompt',
    };
  } else if (totalLogs > 0) {
    // Has some logs but inactive
    banner = {
      title: '🌱 Time to nurture your growth!',
      description: 'Your plant misses you. Add an entry to continue your wellness journey.',
      type: 'prompt',
    };
  } else {
    // Complete beginner
    banner = {
      title: 'Let\'s get started!',
      description: 'Add your first mood or journal entry to begin growing your wellness garden.',
      type: 'prompt',
    };
  }

  return { banner, required, logsRemaining };
}

module.exports = getRecommendation;
