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

export function calculateMoodStreak(moodLogs) {
  if (!moodLogs || moodLogs.length === 0) return 0;

  const datesSet = new Set(
    moodLogs.map(entry => new Date(entry.createdAt).toDateString())
  );

  let streak = 0;
  let currentDate = new Date();

  while (datesSet.has(currentDate.toDateString())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
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
