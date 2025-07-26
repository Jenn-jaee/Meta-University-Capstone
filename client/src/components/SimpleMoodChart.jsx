import { useState, useEffect } from 'react';
import './MoodChart.css';

const SimpleMoodChart = ({ moodData }) => {
  const [hasData, setHasData] = useState(true);

  // Check if we have valid data to display
  useEffect(() => {
    setHasData(Array.isArray(moodData) && moodData.length > 0);
  }, [moodData]);

  // These emoji constants are used directly in the JSX below
  // for the y-axis labels and legend

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric'
    });
  };

  if (!hasData) {
    return (
      <div className="enhanced-mood-chart empty-state">
        <p>No mood data available to display at this time.</p>
      </div>
    );
  }

  // Sort data by date (oldest to newest) for display
  const sortedData = [...moodData].sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Create smooth path for the line
  const createSmoothPath = () => {
    if (sortedData.length < 2) return null;

    const points = sortedData.map((entry, index) => ({
      x: (index / (sortedData.length - 1)) * 100,
      y: (entry.mood / 5) * 100
    }));

    // Create SVG path
    let path = `M ${points[0].x} ${100 - points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const nextPoint = points[i + 1];

      // Calculate control points for smooth curve
      const controlX = (currentPoint.x + nextPoint.x) / 2;

      path += ` C ${controlX} ${100 - currentPoint.y}, ${controlX} ${100 - nextPoint.y}, ${nextPoint.x} ${100 - nextPoint.y}`;
    }

    return path;
  };

  return (
    <div className="enhanced-mood-chart">
      <div className="simple-chart-container">
      <div className="y-axis-labels">
          <div className="y-label">😢 Sad</div>
          <div className="y-label">😟 Troubled</div>
          <div className="y-label">😐 Neutral</div>
          <div className="y-label">😊 Happy</div>
          <div className="y-label">🤩 Excited</div>
        </div>

        <div className="chart-area">
          <div className="chart-grid">
            {[5, 4, 3, 2, 1, 0].map(level => (
              <div key={level} className="grid-line"></div>
            ))}
          </div>

          {/* SVG for smooth line */}
          <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={createSmoothPath()}
              className="smooth-line"
              fill="none"
              stroke="rgba(75, 192, 192, 1)"
              strokeWidth="2"
            />
          </svg>

          <div className="data-points">
            {sortedData.map((entry, index) => (
              <div
                key={entry.id || index}
                className="data-point"
                style={{
                  left: `${(index / (sortedData.length - 1 || 1)) * 100}%`,
                  bottom: `${(entry.mood / 5) * 100}%`
                }}
                title={`${formatDate(entry.createdAt)}: ${entry.note || 'No note'}`}
              >
                <span className="point-marker"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="x-axis-labels">
        {sortedData.map((entry, index) => (
          <div
            key={entry.id || index}
            className="x-label"
            style={{
              left: `${(index / (sortedData.length - 1 || 1)) * 100}%`,
            }}
          >
            {formatDate(entry.createdAt)}
          </div>
        ))}
      </div>

      <div className="mood-legend">
        <div className="legend-item"><span className="legend-emoji">😢</span> Sad</div>
        <div className="legend-item"><span className="legend-emoji">😟</span> Troubled</div>
        <div className="legend-item"><span className="legend-emoji">😐</span> Neutral</div>
        <div className="legend-item"><span className="legend-emoji">😊</span> Happy</div>
        <div className="legend-item"><span className="legend-emoji">🤩</span> Excited</div>
      </div>
    </div>
  );
};

export default SimpleMoodChart;
