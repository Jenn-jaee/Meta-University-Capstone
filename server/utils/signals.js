// server/utils/signals.js
const {
  getUserMoodLogs,
  getUserJournalEntries,
  hasStreakReset,
  daysSinceLastJournal,
  detectMoodVolatility,
  getLastJournalEntry,
  getWeeklyMoodLogCount,
  getPreviousWeeklyMoodCount,
  isLateNightEntry,
  entryContainsDistressWords
} = require('./signalUtils');

const { isDistressed, isPositive } = require('./sentimentAnalysis');
const { getUserSentimentProfile, getTopWords } = require('./wordFrequencyTracker');

// Detects a significant drop in mood compared to previous entry
async function detectMoodDrop(userId, prisma) {
  const moods = await getUserMoodLogs(userId, prisma, 2);
  if (moods.length < 2) return null;

  const [latest, previous] = moods;
  const drop = previous.mood - latest.mood;

  // Only detect mood drops that happened within the last 24 hours
  const latestMoodTime = new Date(latest.createdAt).getTime();
  const currentTime = Date.now();
  const hoursSinceLatestMood = (currentTime - latestMoodTime) / (1000 * 60 * 60);

  // If the mood drop is more than 24 hours old, don't show the banner
  if (hoursSinceLatestMood > 24) {
    return null;
  }

  if (drop >= 2) {
    return {
      tag: 'mood_drop',
      weight: 4,
      message: 'Noticed a sharp mood drop recently.'
    };
  }

  return null;
}

// Detects if user had a low mood (0 or 1)
async function detectLowMood(userId, prisma) {
  const moods = await getUserMoodLogs(userId, prisma, 1);
  if (!moods.length) return null;

  // Only detect low moods that happened within the last 24 hours
  const latestMoodTime = new Date(moods[0].createdAt).getTime();
  const currentTime = Date.now();
  const hoursSinceLatestMood = (currentTime - latestMoodTime) / (1000 * 60 * 60);

  // If the mood log is more than 24 hours old, don't show the banner
  if (hoursSinceLatestMood > 24) {
    return null;
  }

  if (moods[0].mood <= 1) {
    return {
      tag: 'low_mood',
      weight: 3,
      message: 'You logged a low mood today.'
    };
  }

  return null;
}

// Detects if user broke a recent streak
async function detectStreakReset(userId, prisma) {
  const moods = await getUserMoodLogs(userId, prisma, 2);
  if (!moods.length) return null;

  const streakBroken = hasStreakReset(moods);
  if (streakBroken) {
    return {
      tag: 'streak_reset',
      weight: 3,
      message: 'Looks like your streak was broken recently.'
    };
  }

  return null;
}

// Detects if user hasn't journaled in the past 3+ days
async function detectJournalGap(userId, prisma) {
  const entries = await getUserJournalEntries(userId, prisma, 1);
  if (!entries.length) {
    return {
      tag: 'no_journals_yet',
      weight: 5,
      message: "You haven't started journaling yet — why not try today?"
    };
  }

  const lastEntryDate = new Date(entries[0].createdAt);
  const now = new Date();
  const daysAgo = (now - lastEntryDate) / (1000 * 60 * 60 * 24);

  if (daysAgo >= 3) {
    return {
      tag: 'journal_gap',
      weight: 3,
      message: "It's been a few days since your last journal. Want to reflect today?"
    };
  }

  return null;
}

// NEW SIGNAL: Mood Swing Spike (positive swing)
async function detectMoodSwing(userId, prisma) {
  const moods = await getUserMoodLogs(userId, prisma, 2);
  if (moods.length < 2) return null;

  const [latest, previous] = moods;
  const rise = latest.mood - previous.mood;

  // Only detect mood swings that happened within the last 24 hours
  const latestMoodTime = new Date(latest.createdAt).getTime();
  const currentTime = Date.now();
  const hoursSinceLatestMood = (currentTime - latestMoodTime) / (1000 * 60 * 60);

  // If the mood swing is more than 24 hours old, don't show the banner
  if (hoursSinceLatestMood > 24) {
    return null;
  }

  if (rise >= 3) {
    return {
      tag: 'mood_swing',
      weight: 3,
      message: 'You had a big mood change today. How are you feeling about it?'
    };
  }

  return null;
}

// NEW SIGNAL: Mood Swing Frequency
async function detectMoodVolatilitySignal(userId, prisma) {
  const moods = await getUserMoodLogs(userId, prisma, 5);
  if (moods.length < 4) return null;

  const volatile = detectMoodVolatility(moods.map(m => m.mood));
  if (volatile) {
    return {
      tag: 'mood_volatility',
      weight: 3,
      message: 'Your mood has been fluctuating a lot. Want to take a moment to reflect?'
    };
  }

  return null;
}

// Detects negative or distressing emotional keywords or tone
async function detectDistressSignal(userId, prisma) {
  const entry = await getLastJournalEntry(userId, prisma);
  if (!entry || !entry.content) return null;

  // Only detect distress in journal entries from the last 48 hours
  const entryTime = new Date(entry.createdAt).getTime();
  const currentTime = Date.now();
  const hoursSinceEntry = (currentTime - entryTime) / (1000 * 60 * 60);

  // If the journal entry is more than 48 hours old, don't show the banner
  if (hoursSinceEntry > 48) {
    return null;
  }

  const distress = isDistressed(entry.content);

  if (distress) {
    return {
      tag: 'distress_text',
      weight: 4,
      message: 'We noticed some distressing language in your last journal. Want to talk about it?'
    };
  }

  return null;
}

// Detects strong positive and uplifting sentiment
async function detectUpliftSignal(userId, prisma) {
  const entry = await getLastJournalEntry(userId, prisma);
  if (!entry || !entry.content) return null;

  // Only detect positive sentiment in journal entries from the last 48 hours
  const entryTime = new Date(entry.createdAt).getTime();
  const currentTime = Date.now();
  const hoursSinceEntry = (currentTime - entryTime) / (1000 * 60 * 60);

  // If the journal entry is more than 48 hours old, don't show the banner
  if (hoursSinceEntry > 48) {
    return null;
  }

  const uplifting = isPositive(entry.content);

  if (uplifting) {
    return {
      tag: 'positive_reflection',
      weight: 3,
      message: "Your recent journal had some really positive energy — keep it up!"
    };
  }

  return null;
}

// NEW SIGNAL: Engagement Drop
async function detectEngagementDrop(userId, prisma) {
  const thisWeek = await getWeeklyMoodLogCount(userId, prisma, 0);
  const lastWeek = await getPreviousWeeklyMoodCount(userId, prisma, 1);

  if (lastWeek >= 4 && thisWeek <= 1) {
    return {
      tag: 'engagement_drop',
      weight: 4,
      message: "Your activity has dropped this week. It's okay to slow down — want to check in today?"
    };
  }

  return null;
}

// NEW SIGNAL: Late Night Logging
async function detectLateNightEntry(userId, prisma) {
  const mood = await getUserMoodLogs(userId, prisma, 1);
  const journal = await getUserJournalEntries(userId, prisma, 1);

  const lateMood = mood[0] && isLateNightEntry(mood[0].createdAt);
  const lateJournal = journal[0] && isLateNightEntry(journal[0].createdAt);

  if (lateMood || lateJournal) {
    return {
      tag: 'off_hours_activity',
      weight: 2,
      message: "We noticed you checked in late at night. Hope everything's okay. Want to talk?"
    };
  }

  return null;
}

// Detects streak milestone achievements (e.g., 3, 7, 14 days)
async function detectStreakMilestone(userId, prisma) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    });

    const streak = user?.currentStreak ?? null;
    if (typeof streak !== 'number') return null;

    const milestoneTags = {
      3: 'milestone-streak-3',
      7: 'milestone-streak-7',
      14: 'milestone-streak-14',
    };

    if (milestoneTags[streak]) {
      return {
        tag: milestoneTags[streak],
        message: `You've hit a ${streak}-day streak! Keep it up.`,
        weight: 5, // Highest priority for milestone achievements
        habitStreak: streak,
      };
    }

    return null;
  } catch (err) {
    return null;
  }
}

// NEW SIGNAL: Word Usage Insights
// Analyzes user's most frequently used words to provide personalized insights
async function detectWordUsageInsights(userId) {
  try {
    // Get user's sentiment profile based on word frequencies
    const profile = await getUserSentimentProfile(userId);

    // If we don't have enough data, don't show this signal
    if (profile.totalWords < 5) return null;

    // Get the top words
    const topWords = await getTopWords(userId, 5);

    // Create different messages based on sentiment score
    let message = '';
    let tag = '';
    let weight = 3;

    if (profile.score <= -0.3) {
      // Negative sentiment profile
      const negativeWords = profile.topNegative.map(w => w.word).slice(0, 3).join(', ');
      message = `We noticed words like "${negativeWords}" appear often in your journals. Consider exploring these feelings.`;
      tag = 'word-usage-negative';
      weight = 4;
    } else if (profile.score >= 0.3) {
      // Positive sentiment profile
      const positiveWords = profile.topPositive.map(w => w.word).slice(0, 3).join(', ');
      message = `Words like "${positiveWords}" appear often in your journals. These positive themes are great to reflect on!`;
      tag = 'word-usage-positive';
      weight = 3;
    } else {
      // Neutral sentiment profile
      const allWords = topWords.map(w => w.word).slice(0, 3).join(', ');
      message = `Your most used words include "${allWords}". What patterns do you notice in your journaling?`;
      tag = 'word-usage-neutral';
      weight = 2;
    }

    return {
      tag,
      message,
      weight,
    };
  } catch (err) {
    console.error('Error detecting word usage insights:', err);
    return null;
  }
}

module.exports = {
  // Mood-based signals
  detectMoodDrop,
  detectLowMood,
  detectMoodSwing,
  detectMoodVolatilitySignal,
  detectStreakReset,

  // Journal-based signals
  detectJournalGap,
  detectDistressSignal,
  detectUpliftSignal,

  // Behavior/activity-based signals
  detectEngagementDrop,
  detectLateNightEntry,
  detectStreakMilestone,

  // Word analysis signals
  detectWordUsageInsights
};
