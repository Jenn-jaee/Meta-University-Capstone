// Mapping between mood names and numeric values (0-5)
export const moodMap = {
  // String to number mapping (for form submissions)
  happy: 5,
  excited: 4,
  neutral: 3,
  anxious: 2,
  sad: 1,
  angry: 0,

  // Number to string mapping (for display from database values)
  0: 'angry',
  1: 'sad',
  2: 'anxious',
  3: 'neutral',
  4: 'excited',
  5: 'happy'
};

// Emoji mapping for moods
export const moodEmojis = {
  happy: '😊',
  excited: '🤩',
  neutral: '😐',
  anxious: '😰',
  sad: '😢',
  angry: '😠',
};

// Mood options for selection in forms
export const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'angry', emoji: '😠', label: 'Angry' }
];

export function calculateMoodStreak(logs) {
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
