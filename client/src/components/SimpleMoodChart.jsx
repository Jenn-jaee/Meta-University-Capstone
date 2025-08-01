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
      weekday: 'short' // 'short' gives abbreviated weekday name (Mon, Tue, etc.)
    });
  };

  if (!hasData) {
    return (
      <div className="enhanced-mood-chart empty-state">
        <p>No mood data available to display at this time.</p>
      </div>
    );
  }

  // Prepare data for display with all days of the week
  const prepareWeeklyData = () => {
    if (!moodData || moodData.length === 0) return [];

    // Sort data by date (oldest to newest)
    const sortedData = [...moodData].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Find the earliest and latest dates in the data
    const earliestDate = new Date(sortedData[0].createdAt);
    const latestDate = new Date(sortedData[sortedData.length - 1].createdAt);

    // Create a map of existing data points by date string
    const dataByDate = {};
    sortedData.forEach(entry => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      dataByDate[dateStr] = entry;
    });

    // Create an array with all days in the range
    const allDays = [];
    const currentDate = new Date(earliestDate);

    // Ensure we start from Monday if we're showing a week
    if (sortedData.length <= 7) {
      // Find the Monday of the week containing the earliest date
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Go back to Monday
      currentDate.setDate(currentDate.getDate() - daysToSubtract);
    }

    // Generate all days in the range
    while (currentDate <= latestDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Add the day to our array, either with real data or placeholder
      if (dataByDate[dateStr]) {
        allDays.push(dataByDate[dateStr]);
      } else {
        // Create a placeholder for days with no data
        allDays.push({
          id: `placeholder-${dateStr}`,
          createdAt: new Date(currentDate),
          mood: null, // No mood data for this day
          isPlaceholder: true
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDays;
  };

  // Get the prepared data with all days
  const preparedData = prepareWeeklyData();

  // Create smooth path for the line (only for days with actual data)
  const createSmoothPath = () => {
    // Filter out placeholders
    const dataPoints = preparedData.filter(entry => !entry.isPlaceholder);

    if (dataPoints.length < 2) return null;

    // Calculate x positions based on the full range of days
    const points = dataPoints.map(entry => {
      // Find the index in the full prepared data
      const index = preparedData.findIndex(item =>
        new Date(item.createdAt).toISOString() === new Date(entry.createdAt).toISOString()
      );

      return {
        x: (index / (preparedData.length - 1)) * 100,
        y: (entry.mood / 5) * 100
      };
    });

    // Sort points by x value to ensure proper path
    points.sort((a, b) => a.x - b.x);

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
            {preparedData.map((entry, index) => (
              !entry.isPlaceholder && (
                <div
                  key={entry.id || index}
                  className="data-point"
                  style={{
                    left: `${(index / (preparedData.length - 1 || 1)) * 100}%`,
                    bottom: `${(entry.mood / 5) * 100}%`
                  }}
                  title={`${formatDate(entry.createdAt)}: ${entry.note || 'No note'}`}
                >
                  <span className="point-marker"></span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <div className="x-axis-labels">
        {preparedData.map((entry, index) => (
          <div
            key={entry.id || index}
            className="x-label"
            style={{
              left: `${(index / (preparedData.length - 1 || 1)) * 100}%`,
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
