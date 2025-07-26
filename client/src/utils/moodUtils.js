// moodUtils.js
// This file contains utilities specifically for the mood logs feature.
// For journal-related mood utilities, see journalMoodUtils.js

// Mapping between mood names and numeric values (1-5) for mood logs
export const moodMap = {
  // String to number mapping (for form submissions)
  excited: 5,
  happy: 4,
  neutral: 3,
  troubled: 2,
  sad: 1,

  // Number to string mapping (for display from database values)
  1: 'sad',
  2: 'troubled',
  3: 'neutral',
  4: 'happy',
  5: 'excited'
};

// Emoji mapping for mood logs
export const moodEmojis = {
  sad: '😢',
  troubled: '😟',
  neutral: '😐',
  happy: '😊',
  excited: '🤩',
};

// Mood options for selection in mood log forms
export const moodOptions = [
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'troubled', emoji: '😟', label: 'Troubled' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🤩', label: 'Excited' }
];

// Helper function to get mood emoji by numeric value
export const getMoodEmoji = (value) => {
  // Map numeric values to emojis directly
  const moodEmojisMap = {
    1: '😢', // Sad
    2: '😟', // Troubled
    3: '😐', // Neutral
    4: '😊', // Happy
    5: '🤩', // Excited
  };

  return moodEmojisMap[value] || '😐'; // Default to neutral
};

// Helper function to get mood name by numeric value
export const getMoodName = (value) => {
  const moodNamesMap = {
    1: 'Sad',
    2: 'Troubled',
    3: 'Neutral',
    4: 'Happy',
    5: 'Excited'
  };

  return moodNamesMap[value] || 'Neutral';
};

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
    return 0; // Streak is not current
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
