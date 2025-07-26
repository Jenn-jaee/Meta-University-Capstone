
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
  // Use proper date sorting to ensure correct order
  const uniqueDates = Array.from(dateSet).sort((a, b) => {
    return new Date(b) - new Date(a); // Sort in descending order (newest first)
  });

  // Find the most recent log date
  let mostRecentLogDate = uniqueDates[0];

  // Check if the streak is current (today or yesterday)
  const today = toDayString(new Date());
  const yesterday = toDayString(new Date(Date.now() - 86400000));

  // A streak is only valid if the most recent log is from today or yesterday
  const isCurrentStreak = mostRecentLogDate === today || mostRecentLogDate === yesterday;

  if (!isCurrentStreak) {
    return 0;
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
