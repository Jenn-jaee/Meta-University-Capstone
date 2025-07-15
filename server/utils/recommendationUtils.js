
// Convert a Date to YYYY-MM-DD string (local)
function toDayString(date) {
  return new Date(date).toISOString().split('T')[0];
}

// Calculate consecutive days streak from log entries with `createdAt` field
// Returns the number of consecutive days ending today
function calculateStreak(logs) {
  const dayStrings = new Set(logs.map((entry) => toDayString(entry.createdAt)));

  let streak = 0;
  let current = new Date();

  while (dayStrings.has(toDayString(current))) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

// Given logs, return unique day strings
function getUniqueDays(logs) {
  const daySet = new Set(logs.map((entry) => toDayString(entry.createdAt)));
  return Array.from(daySet);
}

module.exports = { calculateStreak, getUniqueDays };
