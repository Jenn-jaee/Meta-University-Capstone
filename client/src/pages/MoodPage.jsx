import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.js';
import './MoodPage.css';
import { Line } from 'react-chartjs-2';
import { calculateMoodStreak } from '../utils/moodUtils';
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

function MoodPage() {
  const [, setMoodLogs] = useState([]);
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
        // Error handled silently - UI will show loading state
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
