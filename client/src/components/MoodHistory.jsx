import { useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { moodEmojis } from '../utils/moodUtils';
import './MoodHistory.css';

const MoodHistory = ({ moodData }) => {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  if (!moodData || moodData.length === 0) {
    return (
      <div className="mood-history empty-state">
        <h3>Mood History</h3>
        <p>No mood data available yet.</p>
        <p>Start logging your mood daily to build your history!</p>
      </div>
    );
  }

  // Group mood data by week
  const groupMoodDataByWeek = () => {
    // Sort data by date (oldest first)
    const sortedData = [...moodData].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const weeks = [];
    let currentWeek = [];
    let currentWeekStart = null;

    sortedData.forEach(entry => {
      const entryDate = new Date(entry.createdAt);

      // If this is the first entry or we need to start a new week
      if (!currentWeekStart || daysDifference(currentWeekStart, entryDate) >= 7) {
        if (currentWeek.length > 0) {
          weeks.push({
            startDate: currentWeekStart,
            endDate: new Date(currentWeek[currentWeek.length - 1].createdAt),
            entries: currentWeek
          });
        }

        currentWeekStart = new Date(entryDate);
        currentWeekStart.setHours(0, 0, 0, 0);
        currentWeek = [entry];
      } else {
        currentWeek.push(entry);
      }
    });

    // Add the last week if it has entries
    if (currentWeek.length > 0) {
      weeks.push({
        startDate: currentWeekStart,
        endDate: new Date(currentWeek[currentWeek.length - 1].createdAt),
        entries: currentWeek
      });
    }

    // Reverse the array so most recent weeks come first
    return weeks.reverse();
  };

  // Calculate days difference between two dates
  const daysDifference = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    const options = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  // Get mood emoji for a given value
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate average mood for a week
  const calculateWeeklyAverage = (entries) => {
    if (!entries || entries.length === 0) return 0;

    const sum = entries.reduce((total, entry) => total + entry.mood, 0);
    return Math.round((sum / entries.length) * 10) / 10;
  };

  const weeks = groupMoodDataByWeek();
  const currentWeek = weeks[selectedWeekIndex] || { entries: [] };

  return (
    <div className="mood-history">
      <h3>Mood History</h3>

      <div className="week-navigation">
        <button
          className="nav-button"
          disabled={selectedWeekIndex >= weeks.length - 1}
          onClick={() => setSelectedWeekIndex(prev => Math.min(prev + 1, weeks.length - 1))}
        >
          <FaChevronLeft /> Older
        </button>

        <div className="week-indicator">
          {currentWeek.startDate && currentWeek.endDate ? (
            <>
              <FaCalendarAlt className="calendar-icon" />
              <span>{formatDateRange(currentWeek.startDate, currentWeek.endDate)}</span>
            </>
          ) : (
            <span>No data</span>
          )}
        </div>

        <button
          className="nav-button"
          disabled={selectedWeekIndex <= 0}
          onClick={() => setSelectedWeekIndex(prev => Math.max(prev - 1, 0))}
        >
          Newer <FaChevronRight />
        </button>
      </div>

      <div className="week-summary">
        <div className="week-average">
          <span className="average-label">Week Average:</span>
          <span className="average-value">
            {getMoodEmoji(Math.round(calculateWeeklyAverage(currentWeek.entries)))}
            {calculateWeeklyAverage(currentWeek.entries)}
          </span>
        </div>
        <div className="entry-count">
          <span>{currentWeek.entries.length} entries</span>
        </div>
      </div>

      <div className="mood-entries">
        {currentWeek.entries.map(entry => (
          <div key={entry.id} className="mood-entry">
            <div className="entry-date">{formatDate(entry.createdAt)}</div>
            <div className="entry-mood">
              <span className="mood-emoji">{getMoodEmoji(entry.mood)}</span>
            </div>
            {entry.note && <div className="entry-note">{entry.note}</div>}
          </div>
        ))}
      </div>

      <div className="week-pagination">
        {weeks.map((_, index) => (
          <button
            key={index}
            className={`pagination-dot ${selectedWeekIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedWeekIndex(index)}
            aria-label={`Week ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MoodHistory;
