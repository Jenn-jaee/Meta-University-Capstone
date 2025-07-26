// journalMoodUtils.js
// This file contains mood-related utilities specifically for the journal feature.
// These are completely separate from the mood logs system.

// Mapping between journal mood names and numeric values (0-5)
export const journalMoodMap = {
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

// Emoji mapping for journal moods
export const journalMoodEmojis = {
  happy: '😊',
  excited: '🤩',
  neutral: '😐',
  anxious: '😰',
  sad: '😢',
  angry: '😠',
};

// Journal mood options for selection in forms
export const journalMoodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'angry', emoji: '😠', label: 'Angry' }
];

// Get journal mood emoji for a given numeric value
export const getJournalMoodEmoji = (value) => {
  const moodName = journalMoodMap[value];
  return moodName ? journalMoodEmojis[moodName] : journalMoodEmojis.neutral;
};

// Get journal mood name for a given numeric value
export const getJournalMoodName = (value) => {
  const moodNamesMap = {
    0: 'Angry',
    1: 'Sad',
    2: 'Anxious',
    3: 'Neutral',
    4: 'Excited',
    5: 'Happy'
  };

  return moodNamesMap[value] || 'Neutral';
};
