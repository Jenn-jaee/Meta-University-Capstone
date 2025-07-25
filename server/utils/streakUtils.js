
function calculateMoodStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  // Convert dates to YYYY-MM-DD strings for consistent comparison
  const toDayString = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // Get all unique dates with logs
  const dateSet = new Set();
  logs.forEach(log => {
    dateSet.add(toDayString(log.createdAt));
  });

  // Convert to array and sort (newest first)
  const uniqueDates = Array.from(dateSet).sort().reverse();

  // Find the most recent log date
  let mostRecentLogDate = uniqueDates[0];

  // If the most recent log is not from today or yesterday, streak is broken
  const today = toDayString(new Date());
  if (mostRecentLogDate !== today) {
    const yesterday = toDayString(new Date(Date.now() - 86400000));
    if (mostRecentLogDate !== yesterday) {
      return 0; // Streak is broken
    }
  }

  // Start counting streak from most recent log
  let currentStreak = 1;
  let currentDate = mostRecentLogDate;

  // Check for consecutive days working backward
  while (true) {
    // Get the previous day
    const prevDate = toDayString(new Date(new Date(currentDate).getTime() - 86400000));

    // If there's a log for the previous day, increment streak
    if (dateSet.has(prevDate)) {
      currentStreak++;
      currentDate = prevDate;
    } else {
      // Gap found, streak ends
      break;
    }
  }

  return currentStreak;
}


async function updateUserStreak(userId, prisma) {
  try {
    // Get all mood logs for the user
    const moodLogs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate the streak
    const streak = calculateMoodStreak(moodLogs);

    // Update the user's streak in the database
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: streak },
    });

    return streak;
  } catch (error) {
    // Silent error handling for streak updates
    return 0;
  }
}

module.exports = {
  calculateMoodStreak,
  updateUserStreak,
};
