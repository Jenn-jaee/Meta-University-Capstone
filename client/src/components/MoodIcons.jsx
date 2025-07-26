// Base face component to reduce repetition
const BaseFace = ({ children }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    {children}
  </svg>
);

// Standard eyes that most faces use
const StandardEyes = () => (
  <>
    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
  </>
);

export const MoodIcons = {
  // Happy - Smiling face with slight curve
  Happy: () => (
    <BaseFace>
      <path d="M8 14C8.5 16 10 17 12 17C14 17 15.5 16 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <StandardEyes />
    </BaseFace>
  ),

  // Excited - Smiling face with star eyes
  Excited: () => (
    <BaseFace>
      <path d="M7 14C8 17 10 18 12 18C14 18 16 17 17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 9.5L7 8L8.5 6.5L10 8L8.5 9.5Z" fill="currentColor" />
      <path d="M15.5 9.5L14 8L15.5 6.5L17 8L15.5 9.5Z" fill="currentColor" />
    </BaseFace>
  ),

  // Neutral - Straight line mouth
  Neutral: () => (
    <BaseFace>
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <StandardEyes />
    </BaseFace>
  ),

  // Anxious - Worried face with sweat drop
  Anxious: () => (
    <BaseFace>
      <path d="M8 15C9 13.5 10.5 13 12 13C13.5 13 15 13.5 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <StandardEyes />
      <path d="M18 6L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </BaseFace>
  ),

  // Sad - Frowning face
  Sad: () => (
    <BaseFace>
      <path d="M16 16C15.5 14 14 13 12 13C10 13 8.5 14 8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <StandardEyes />
    </BaseFace>
  ),

  // Angry - Frowning face with furrowed brows
  Angry: () => (
    <BaseFace>
      <path d="M16 16C15.5 14 14 13 12 13C10 13 8.5 14 8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 9L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <StandardEyes />
    </BaseFace>
  )
};

import { getJournalMoodName } from '../utils/journalMoodUtils';

export const getMoodIcon = (value) => {
  const moodIcons = {
    5: { icon: <MoodIcons.Happy />, name: getJournalMoodName(5) },
    4: { icon: <MoodIcons.Excited />, name: getJournalMoodName(4) },
    3: { icon: <MoodIcons.Neutral />, name: getJournalMoodName(3) },
    2: { icon: <MoodIcons.Anxious />, name: getJournalMoodName(2) },
    1: { icon: <MoodIcons.Sad />, name: getJournalMoodName(1) },
    0: { icon: <MoodIcons.Angry />, name: getJournalMoodName(0) }
  };
  return moodIcons[value] || moodIcons[3]; // Default to neutral
};

export default MoodIcons;
