export const journalMessages = [
  "Your safe space for thoughts and reflections",
  "Capture your journey, one entry at a time",
  "Write freely, reflect deeply",
  "Today's thoughts become tomorrow's insights",
  "A moment of reflection is a gift to yourself",
  "Your story matters - write it your way",
  "Every entry is a step in your personal journey",
  "Document your growth, celebrate your progress",
  "Find clarity through your own words",
  "Transform thoughts into wisdom through writing",
  "Your journal, your sanctuary",
  "Embrace the power of your own narrative",
  "Thoughts become clearer when written down",
  "Create your personal time capsule of memories",
  "Your thoughts deserve to be heard - even if just by you"
];

// Function to get a random message
export const getRandomJournalMessage = () => {
  const randomIndex = Math.floor(Math.random() * journalMessages.length);
  return journalMessages[randomIndex];
};
