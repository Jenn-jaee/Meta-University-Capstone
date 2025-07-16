// server/utils/recommendationStates.js
// Finite‑state “rules” array (exported as default)

module.exports = [
  {
    id: 'low-engagement',
    condition: ({ streak, totalLogs }) => totalLogs < 3,
    message: {
      title: 'Let’s build your first streak!',
      description:
        'Check in daily with your mood or a journal entry to start growing your plant.',
      type: 'info',
    },
  },

  {
    id: 'almost-there',
    condition: ({ streak }) => streak === 2,
    message: {
      title: 'One more day to grow your plant!',
      description:
        'You’re just 1 day away from the next growth stage. Keep it up!',
      type: 'success',
    },
  },

  {
    id: 'streak-reset',
    condition: ({ streak, lastLogDate }) => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      return (
        streak === 0 &&
        new Date(lastLogDate).toDateString() === yesterday.toDateString()
      );
    },
    message: {
      title: 'Oops! Your streak just reset.',
      description:
        'No worries — you can always start again. Try logging today to begin a new streak.',
      type: 'warning',
    },
  },

  {
    id: 'strong-streak',
    // streak is available from the argument object ⬇
    condition: ({ streak }) => streak >= 3,
    // need a factory so the number gets interpolated
    message: ({ streak }) => ({
      title: `🔥 ${streak}-day streak! Keep going!`,
      description:
        'Amazing consistency! Keep logging to reach a new milestone.',
      type: 'celebrate',
    }),
  },
];
