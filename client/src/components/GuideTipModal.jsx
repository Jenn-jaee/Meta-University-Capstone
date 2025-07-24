import './GuideTipModal.css';

function GuideTipModal({ type, onClose }) {
  // Define different guide tips based on the banner type
  const getTipContent = () => {
    switch (type) {
      case 'distress_text':
        return {
          title: 'Managing Emotional Distress',
          tips: [
            'Take a few deep breaths - inhale for 4 counts, hold for 2, exhale for 6',
            'Reach out to a trusted friend or family member',
            'Try the 5-4-3-2-1 grounding technique: identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste',
            'Consider speaking with a mental health professional if distress persists',
            'Remember that it\'s okay to not be okay sometimes'
          ]
        };

      case 'mood_drop':
      case 'low_mood':
        return {
          title: 'Lifting Your Mood',
          tips: [
            'Get some sunlight and fresh air for at least 10 minutes',
            'Move your body - even a short walk can help release endorphins',
            'Listen to uplifting music or a favorite podcast',
            'Practice self-compassion - speak to yourself as you would to a good friend',
            'Try to identify what might be affecting your mood and write about it'
          ]
        };

      case 'mood_swing':
      case 'mood_volatility':
        return {
          title: 'Managing Mood Changes',
          tips: [
            'Notice patterns in your mood changes without judgment',
            'Establish consistent daily routines for sleep, meals, and activities',
            'Practice mindfulness to stay present rather than getting caught in emotional waves',
            'Consider tracking mood triggers in your journal',
            'Give yourself permission to feel your emotions without acting on them immediately'
          ]
        };

      case 'streak_reset':
        return {
          title: 'Getting Back on Track',
          tips: [
            'Remember that progress isn\'t linear - setbacks are part of the journey',
            'Focus on today rather than yesterday\'s missed opportunity',
            'Start small with an achievable goal for today',
            'Reflect on what obstacles got in your way and plan how to address them',
            'Celebrate showing up again - that\'s the most important part!'
          ]
        };

      case 'journal_gap':
      case 'no_journals_yet':
        return {
          title: 'Journaling Tips',
          tips: [
            'Start with just 5 minutes of writing - no pressure to write more',
            'Try a prompt: "Today I felt..." or "One thing I\'m grateful for is..."',
            'There\'s no "wrong way" to journal - write whatever comes to mind',
            'Consider using bullet points if full sentences feel overwhelming',
            'Remember that consistency matters more than length or quality'
          ]
        };

      case 'engagement_drop':
        return {
          title: 'Rebuilding Momentum',
          tips: [
            'Remember why you started this wellness journey',
            'Set a small, achievable goal for today',
            'Try changing up your routine to make it feel fresh again',
            'Be kind to yourself - life gets busy sometimes',
            'Consider what obstacles are getting in your way and how you might address them'
          ]
        };

      case 'positive_reflection':
        return {
          title: 'Building on Positive Momentum',
          tips: [
            'Take a moment to savor this positive feeling',
            'Reflect on what contributed to this positive state',
            'Consider how you might recreate these conditions in the future',
            'Share your positive experience with someone you trust',
            'Use this energy to tackle something you have been putting off'
          ]
        };

      default:
        return {
          title: 'Wellness Tips',
          tips: [
            'Practice mindfulness for a few minutes each day',
            'Stay hydrated and maintain regular meals',
            'Aim for 7-9 hours of sleep each night',
            'Move your body in ways that feel good to you',
            'Connect with supportive people in your life'
          ]
        };
    }
  };

  const { title, tips } = getTipContent();

  return (
    <div className="guide-tip-overlay">
      <div className="guide-tip-modal">
        <button className="guide-close-btn" onClick={onClose}>×</button>
        <h2>{title}</h2>
        <ul className="tip-list">
          {tips.map((tip, index) => (
            <li key={index} className="tip-item">
              <span className="tip-number">{index + 1}</span>
              <span className="tip-text">{tip}</span>
            </li>
          ))}
        </ul>
        <div className="guide-footer">
          <p>Remember, these are just suggestions. Do what works best for you.</p>
          <button className="guide-action-btn" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

export default GuideTipModal;
