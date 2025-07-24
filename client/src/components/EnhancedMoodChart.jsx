import { useRef, useEffect, useState } from 'react';
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
import { moodEmojis } from '../utils/moodUtils';
import './EnhancedMoodChart.css';

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);


const EnhancedMoodChart = ({ moodData }) => {
  const chartRef = useRef(null);
  const [hasData, setHasData] = useState(true);

  // Check if we have valid data to display
  useEffect(() => {
    setHasData(Array.isArray(moodData) && moodData.length > 0);
  }, [moodData]);

  // Map mood values to their corresponding emojis
  const getMoodEmoji = (value) => {
    const moodNames = {
      0: 'angry',
      1: 'sad',
      2: 'anxious',
      3: 'neutral',
      4: 'excited',
      5: 'happy'
    };

    const moodName = moodNames[value] || 'neutral';
    return moodEmojis[moodName];
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const chartData = {
    labels: moodData.map(entry => formatDate(entry.createdAt)),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map(entry => entry.mood),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 10,
        pointHoverRadius: 12,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgba(75, 192, 192, 1)',
        pointBorderWidth: 2,
      },
    ],
  };

  // Chart options with custom tooltip
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 5,
        title: {
          display: true,
          text: 'Mood',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {top: 10, bottom: 10}
        },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            // Use emojis instead of text for y-axis labels
            const moodEmojis = {
              0: '😠',
              1: '😢',
              2: '😰',
              3: '😐',
              4: '😁',
              5: '😄'
            };
            return moodEmojis[value] || '';
          },
          font: {
            size: 16
          }
        },
        grid: {
          display: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: {top: 10, bottom: 10}
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#333',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            // Show date in a more readable format
            return context[0].label;
          },
          label: function(context) {
            const value = context.raw;
            const moodLabels = {
              0: 'Angry',
              1: 'Sad',
              2: 'Anxious',
              3: 'Neutral',
              4: 'Excited',
              5: 'Happy'
            };
            const emoji = getMoodEmoji(value);
            const label = moodLabels[value] || 'Unknown';

            // Find the corresponding mood log to get the note
            const index = context.dataIndex;
            const note = moodData[index]?.note;

            const lines = [`${emoji} Feeling: ${label}`];
            if (note) lines.push(`"${note}"`);

            return lines;
          }
        }
      }
    }
  };

  // Add emojis to chart points after rendering
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;

      // Original afterDraw plugin
      const originalAfterDraw = chart.options.plugins.afterDraw;

      // Set new afterDraw plugin
      chart.options.plugins.afterDraw = (chart) => {
        // Call original afterDraw if it exists
        if (originalAfterDraw) originalAfterDraw(chart);

        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          if (!meta.hidden) {
            meta.data.forEach((element, index) => {
              // Draw emoji on top of each point
              const moodValue = dataset.data[index];
              const emoji = getMoodEmoji(moodValue);

              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = '16px Arial';
              ctx.fillText(emoji, element.x, element.y);
              ctx.restore();
            });
          }
        });
      };

      chart.update();
    }
  }, [moodData]);

  if (!hasData) {
    return (
      <div className="enhanced-mood-chart empty-state">
        <p>No mood data available to display.</p>
        <p>Start logging your mood daily to see your trends!</p>
      </div>
    );
  }

  return (
    <div className="enhanced-mood-chart">
      <Line ref={chartRef} data={chartData} options={chartOptions} />
      <div className="mood-legend">
        <div className="legend-item"><span className="legend-emoji">😠</span> Angry</div>
        <div className="legend-item"><span className="legend-emoji">😢</span> Sad</div>
        <div className="legend-item"><span className="legend-emoji">😰</span> Anxious</div>
        <div className="legend-item"><span className="legend-emoji">😐</span> Neutral</div>
        <div className="legend-item"><span className="legend-emoji">😁</span> Happy</div>
        <div className="legend-item"><span className="legend-emoji">😄</span> Excited</div>
      </div>
    </div>
  );
};

export default EnhancedMoodChart;
