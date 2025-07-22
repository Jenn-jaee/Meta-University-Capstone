import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.js';
import './MoodPage.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Calculate streak correctly - must be consecutive days with no gaps
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

function MoodPage() {
  const [moodLogs, setMoodLogs] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [streak, setStreak] = useState(0);


  useEffect(() => {
    const fetchMoodLogs = async () => {
      try {
        const res = await axios.get('/api/mood-logs');
        setMoodLogs(res.data);

        const labels = res.data.map(entry =>
          new Date(entry.createdAt).toLocaleDateString()
        );

        const moodValues = res.data.map(entry => entry.mood);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Mood Trend',
              data: moodValues,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.3,
              pointRadius: 5,
            },
          ],
        });

        // moodlog streak
        setStreak(calculateMoodStreak(res.data));

      } catch (err) {
        console.error('Error fetching mood logs:', err);
      }
    };

    fetchMoodLogs();
  }, []);


  return (
    <div className="mood-page-container">
      <h2 className="mood-page-title">Mood Tracker</h2>
      {chartData ? (
        <div className="mood-chart-container">
          <Line data={chartData} />
        </div>
      ) : (
        <p className="loading-text">Loading your mood trend...</p>
      )}
      <div className="streak-display">
        <p>🔥 Current Mood Streak: <strong>{streak} day{streak === 1 ? '' : 's'}</strong></p>
      </div>
    </div>
  );
}

export default MoodPage;
