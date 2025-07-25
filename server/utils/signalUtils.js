
// Gets a user's mood logs, sorted by most recent
async function getUserMoodLogs(userId, prisma, limit = null) {
  const query = {
    where: { userId },
    orderBy: { createdAt: 'desc' },
  };

  // Only apply limit if specified
  if (limit !== null) {
    query.take = limit;
  }

  return prisma.moodLog.findMany(query);
}

// Gets a user's journal entries, sorted by most recent
async function getUserJournalEntries(userId, prisma, limit = null) {
  const query = {
    where: { userId },
    orderBy: { createdAt: 'desc' },
  };

  // Only apply limit if specified
  if (limit !== null) {
    query.take = limit;
  }

  return prisma.journalEntry.findMany(query);
}

// Simple 2-day streak reset detector (based on mood logs)
function hasStreakReset(moodLogs) {
  if (moodLogs.length < 2) return false;

  const [latest, previous] = moodLogs;
  const daysBetween =
    (new Date(latest.createdAt) - new Date(previous.createdAt)) /
    (1000 * 60 * 60 * 24);

  return daysBetween > 2;
}

// Checks how many days since last journal entry
function daysSinceLastJournal(entries) {
  if (!entries.length) return Infinity;
  const last = new Date(entries[0].createdAt);
  const now = new Date();
  return (now - last) / (1000 * 60 * 60 * 24);
}

// Detects mood volatility (sudden ups/downs)
function detectMoodVolatility(moodArray) {
  if (moodArray.length < 3) return false;

  let swings = 0;
  for (let i = 1; i < moodArray.length; i++) {
    const diff = Math.abs(moodArray[i] - moodArray[i - 1]);
    if (diff >= 2) swings++;
  }

  return swings >= 2;
}

// Gets the last journal entry
async function getLastJournalEntry(userId, prisma) {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  return entries[0];
}

// Gets mood log count for the current week
async function getWeeklyMoodLogCount(userId, prisma) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

  return prisma.moodLog.count({
    where: {
      userId,
      createdAt: {
        gte: startOfWeek,
        lte: now,
      },
    },
  });
}

// Gets mood log count for the previous week
async function getPreviousWeeklyMoodCount(userId, prisma) {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setDate(startOfThisWeek.getDate() - 1); // Saturday
  const startOfLastWeek = new Date(endOfLastWeek);
  startOfLastWeek.setDate(endOfLastWeek.getDate() - 6); // Previous Sunday

  return prisma.moodLog.count({
    where: {
      userId,
      createdAt: {
        gte: startOfLastWeek,
        lte: endOfLastWeek,
      },
    },
  });
}

// Detects if a timestamp is late night (after 12am)
function isLateNightEntry(timestamp) {
  const hour = new Date(timestamp).getHours();
  return hour >= 0 && hour < 5;
}

// Simple distress word detector
function entryContainsDistressWords(content) {
  const distressWords = ['numb', 'worthless', 'empty', 'burnt out', 'lost'];
  const lowered = content.toLowerCase();

  return distressWords.some(word => lowered.includes(word));
}

module.exports = {
  getUserMoodLogs,
  getUserJournalEntries,
  hasStreakReset,
  daysSinceLastJournal,
  detectMoodVolatility,
  getLastJournalEntry,
  getWeeklyMoodLogCount,
  getPreviousWeeklyMoodCount,
  isLateNightEntry,
  entryContainsDistressWords,
};
