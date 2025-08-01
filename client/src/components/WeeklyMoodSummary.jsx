import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { getMoodEmoji, getMoodName } from '../utils/moodUtils';
import './WeeklyMoodSummary.css';

const WeeklyMoodSummary = ({ weeklyData }) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="weekly-mood-summary empty-state">
        <p>No mood data available for this week.</p>
        <p>Start logging your mood daily to see your weekly summary!</p>
      </div>
    );
  }

  // Calculate average mood
  const moodValues = weeklyData.map(entry => entry.mood);
  const averageMood = moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length;
  const roundedAverage = Math.round(averageMood * 10) / 10; // Round to 1 decimal place

  // Find most frequent mood
  const moodFrequency = {};
  moodValues.forEach(value => {
    moodFrequency[value] = (moodFrequency[value] || 0) + 1;
  });

  let mostFrequentMood = null;
  let highestFrequency = 0;

  Object.entries(moodFrequency).forEach(([mood, frequency]) => {
    if (frequency > highestFrequency) {
      mostFrequentMood = parseInt(mood);
      highestFrequency = frequency;
    }
  });

  // Calculate mood variance (how much mood fluctuates)
  const moodVariance = moodValues.length > 1
    ? moodValues.reduce((sum, value) => sum + Math.pow(value - averageMood, 2), 0) / moodValues.length
    : 0;

  // Determine trend (improving, declining, or stable) with more accurate logic
  let trend = 'stable';
  let trendIcon = <FaEquals className="trend-icon stable" />;

  // Sort data by date (oldest first)
  const sortedData = [...weeklyData].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sortedData.length >= 2) {
    // Get mood values in chronological order
    const chronologicalMoods = sortedData.map(entry => entry.mood);

    // Calculate trend score using a more sophisticated algorithm
    let trendScore = 0;

    // Factor 1: Recent trend direction (last 2-3 entries)
    const recentMoods = chronologicalMoods.slice(-3);
    const mostRecent = recentMoods[recentMoods.length - 1];
    const secondMostRecent = recentMoods.length > 1 ? recentMoods[recentMoods.length - 2] : null;

    // Check if most recent mood is high (4-5)
    if (mostRecent >= 4) trendScore += 2;

    // Compare most recent with previous
    if (secondMostRecent !== null) {
      trendScore += (mostRecent - secondMostRecent);
    }

    // Factor 2: Overall trend (first half vs second half)
    const midpoint = Math.floor(chronologicalMoods.length / 2);
    const firstHalf = chronologicalMoods.slice(0, midpoint);
    const secondHalf = chronologicalMoods.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    trendScore += (secondHalfAvg - firstHalfAvg) * 2;

    // Factor 3: Low mood frequency
    const lowMoodsCount = chronologicalMoods.filter(mood => mood <= 2).length;
    const recentLowMoodsCount = chronologicalMoods.slice(-3).filter(mood => mood <= 2).length;

    if (lowMoodsCount > 0 && recentLowMoodsCount === 0) trendScore += 1; // Fewer low moods recently
    if (recentLowMoodsCount >= 2) trendScore -= 2; // Multiple recent low moods

    // Factor 4: Recovery after dip
    const hasRecovery = chronologicalMoods.length >= 4 &&
                        chronologicalMoods[chronologicalMoods.length - 3] > chronologicalMoods[chronologicalMoods.length - 2] &&
                        chronologicalMoods[chronologicalMoods.length - 1] > chronologicalMoods[chronologicalMoods.length - 2];
    if (hasRecovery) trendScore += 1;

    // Determine trend based on score
    if (trendScore >= 2) {
      trend = 'improving';
      trendIcon = <FaArrowUp className="trend-icon improving" />;
    } else if (trendScore <= -2) {
      trend = 'declining';
      trendIcon = <FaArrowDown className="trend-icon declining" />;
    }
  }

  // Using the imported getMoodEmoji and getMoodName functions from moodUtils.js

  // Generate insights based on the data with more personalized messages
  const generateInsight = () => {
    if (moodValues.length < 3) {
      return "Log your mood more frequently to get personalized insights.";
    }

    // Check if most frequent mood is negative
    const isMostFrequentNegative = mostFrequentMood <= 2;

    // Check if most recent mood is negative
    const mostRecentMood = sortedData[sortedData.length - 1]?.mood;
    const isRecentMoodNegative = mostRecentMood !== undefined && mostRecentMood <= 2;

    if (trend === 'improving') {
      if (isMostFrequentNegative) {
        return "Although you've had some low moods, things seem to be improving. Keep an eye on what helps lift your spirits.";
      } else {
        return "Your mood is trending upward this week. Keep up the good work!";
      }
    } else if (trend === 'declining') {
      if (isRecentMoodNegative) {
        return "You've been feeling down recently. Consider reaching out for support or trying activities that have helped you feel better in the past.";
      } else {
        return "Your mood has been declining this week. Take some time for self-care activities.";
      }
    } else if (moodVariance > 2) {
      return "Your mood has been fluctuating significantly this week. Try to identify triggers for these changes.";
    } else if (averageMood >= 4) {
      return "You've been feeling great this week! Reflect on what's working well.";
    } else if (averageMood <= 2) {
      return "You've been feeling down this week. Consider reaching out for support or scheduling activities you enjoy.";
    } else {
      return "Your mood has been relatively stable this week.";
    }
  };

  return (
    <div className="weekly-mood-summary">
      <h3>Weekly Mood Summary</h3>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-value">
            {getMoodEmoji(Math.round(averageMood))}
            <span>{roundedAverage}</span>
          </div>
          <div className="stat-label">Average Mood</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {getMoodEmoji(mostFrequentMood)}
            <span>{getMoodName(mostFrequentMood)}</span>
          </div>
          <div className="stat-label">Most Frequent</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {trendIcon}
            <span className={`trend-text ${trend}`}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>
          </div>
          <div className="stat-label">Trend</div>
        </div>
      </div>

      <div className="mood-insight">
        <h4>Weekly Insight</h4>
        <p>{generateInsight()}</p>
      </div>
    </div>
  );
};

export default WeeklyMoodSummary;
