import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.js';
import { calculateMoodStreak } from '../utils/moodUtils';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import SimpleMoodChart from '../components/SimpleMoodChart';
import WeeklyMoodSummary from '../components/WeeklyMoodSummary';
import MoodHistory from '../components/MoodHistory';
import './MoodPage.css';

// Fallback data in case API call fails - using mood logs format
const fallbackData = [
  { id: 1, mood: 3, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), note: 'Feeling okay' },
  { id: 2, mood: 4, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Pretty good day' },
  { id: 3, mood: 2, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: 'Bit stressed' },
  { id: 4, mood: 5, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Great day!' },
  { id: 5, mood: 3, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Average day' },
  { id: 6, mood: 4, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), note: 'Good progress' },
];

function MoodPage() {
  const [allMoodLogs, setAllMoodLogs] = useState([]);
  const [filteredMoodLogs, setFilteredMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week'); // 'week', 'month', 'year'

  // Date range navigation
  const [currentStartDate, setCurrentStartDate] = useState(null);
  const [currentEndDate, setCurrentEndDate] = useState(null);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const fetchMoodLogs = async () => {
      try {
        setLoading(true);
        // Explicitly fetch from mood logs endpoint to ensure we're using mood log data
        const res = await axios.get('/api/mood-logs');
        const data = res.data;

        if (data && data.length > 0) {
          // Sort data by date (newest first)
          const sortedData = [...data].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );

          setAllMoodLogs(sortedData);

          // Calculate streak
          setStreak(calculateMoodStreak(sortedData));

          // Initialize with current period
          initializeDateRange(sortedData, timeFilter);
        } else {
          // Use fallback data if no data is returned
          setAllMoodLogs(fallbackData);
          setStreak(calculateMoodStreak(fallbackData));
          initializeDateRange(fallbackData, timeFilter);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching mood logs:', err);
        // Use fallback data if API call fails
        setAllMoodLogs(fallbackData);
        setStreak(calculateMoodStreak(fallbackData));
        initializeDateRange(fallbackData, timeFilter);
        setError('Could not load mood data from server. Using sample data instead.');
        setLoading(false);
      }
    };

    fetchMoodLogs();
  }, []);

  // Initialize date range based on time filter
  const initializeDateRange = (data, filter) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    let startDate;

    switch (filter) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6); // Last 7 days including today
        startDate.setHours(0, 0, 0, 0); // Start of the day
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29); // Last 30 days including today
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1); // Last 365 days including today
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }

    setCurrentStartDate(startDate);
    setCurrentEndDate(now);

    // Filter data based on the date range
    const filtered = filterDataByDateRange(data, startDate, now);
    setFilteredMoodLogs(filtered);

    // Can't go forward from current period
    setCanGoForward(false);
  };

  // Effect to update filtered data when time filter or date range changes
  useEffect(() => {
    if (allMoodLogs.length > 0 && currentStartDate && currentEndDate) {
      const filtered = filterDataByDateRange(allMoodLogs, currentStartDate, currentEndDate);
      setFilteredMoodLogs(filtered);
    }
  }, [allMoodLogs, currentStartDate, currentEndDate]);

  // Filter data based on date range
  const filterDataByDateRange = (data, startDate, endDate) => {
    return data.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  // Handle time filter change
  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    initializeDateRange(allMoodLogs, filter);
  };

  // Navigate to previous period
  const goToPreviousPeriod = () => {
    const newEndDate = new Date(currentStartDate);
    newEndDate.setDate(newEndDate.getDate() - 1);
    newEndDate.setHours(23, 59, 59, 999);

    let newStartDate;

    switch (timeFilter) {
      case 'week':
        newStartDate = new Date(newEndDate);
        newStartDate.setDate(newEndDate.getDate() - 6);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        newStartDate = new Date(newEndDate);
        newStartDate.setDate(newEndDate.getDate() - 29);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        newStartDate = new Date(newEndDate);
        newStartDate.setFullYear(newEndDate.getFullYear() - 1);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      default:
        newStartDate = new Date(newEndDate);
        newStartDate.setDate(newEndDate.getDate() - 6);
        newStartDate.setHours(0, 0, 0, 0);
    }

    setCurrentStartDate(newStartDate);
    setCurrentEndDate(newEndDate);
    setCanGoForward(true); // Now we can go forward
  };

  // Navigate to next period
  const goToNextPeriod = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const newStartDate = new Date(currentEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    newStartDate.setHours(0, 0, 0, 0);

    let newEndDate;

    switch (timeFilter) {
      case 'week':
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 29);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        newEndDate = new Date(newStartDate);
        newEndDate.setFullYear(newStartDate.getFullYear() + 1);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        newEndDate.setHours(23, 59, 59, 999);
    }

    // If the new end date is in the future, cap it at today
    if (newEndDate > now) {
      newEndDate = now;
      setCanGoForward(false);
    }

    setCurrentStartDate(newStartDate);
    setCurrentEndDate(newEndDate);
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!currentStartDate || !currentEndDate) return '';

    const options = { month: 'short', day: 'numeric' };

    // If the dates are in different years, include the year
    if (currentStartDate.getFullYear() !== currentEndDate.getFullYear()) {
      return `${currentStartDate.toLocaleDateString('en-US', {...options, year: 'numeric'})} - ${currentEndDate.toLocaleDateString('en-US', {...options, year: 'numeric'})}`;
    }

    return `${currentStartDate.toLocaleDateString('en-US', options)} - ${currentEndDate.toLocaleDateString('en-US', options)}`;
  };

  // Toggle insights visibility
  const toggleInsights = () => {
    setShowInsights(!showInsights);
  };

  // Check if we're viewing the current period
  const isCurrentPeriod = () => {
    if (!currentEndDate) return true;

    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Check if the end date is today
    return currentEndDate.getDate() === endOfToday.getDate() &&
           currentEndDate.getMonth() === endOfToday.getMonth() &&
           currentEndDate.getFullYear() === endOfToday.getFullYear();
  };

  return (
    <div className="mood-page-container">
      <h2 className="mood-page-title">Mood Tracker</h2>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your mood data...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="streak-display">
            <p>🔥 Current Mood Streak: <strong>{streak} day{streak === 1 ? '' : 's'}</strong></p>
          </div>

          <div className="time-filter">
            <button
              className={`filter-button ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => handleFilterChange('week')}
            >
              Week
            </button>
            <button
              className={`filter-button ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => handleFilterChange('month')}
            >
              Month
            </button>
            <button
              className={`filter-button ${timeFilter === 'year' ? 'active' : ''}`}
              onClick={() => handleFilterChange('year')}
            >
              Year
            </button>
          </div>

          <div className="date-navigation">
            <button
              className="nav-button"
              onClick={goToPreviousPeriod}
            >
              <FaChevronLeft /> Previous
            </button>

            <div className="date-range">
              <FaCalendarAlt className="calendar-icon" />
              <span>{formatDateRange()}</span>
            </div>

            <button
              className="nav-button"
              onClick={goToNextPeriod}
              disabled={!canGoForward}
            >
              Next <FaChevronRight />
            </button>
          </div>

          <div className="mood-chart-container">
            <h3>Mood Trend</h3>
            <SimpleMoodChart moodData={filteredMoodLogs} />

            <button
              className="insights-toggle-button"
              onClick={toggleInsights}
            >
              {showInsights ? 'Hide Insights' : 'View Mood Insights'}
            </button>
          </div>

          {showInsights && (
            <div className="mood-insights-container">
              <div className="insights-header">
                <h3>Mood Insights for {isCurrentPeriod() ?
                  `This ${timeFilter === 'week' ? 'Week' : timeFilter === 'month' ? 'Month' : 'Year'}` :
                  formatDateRange()}
                </h3>
              </div>

              <div className="insights-content">
                <WeeklyMoodSummary weeklyData={filteredMoodLogs} />
                <MoodHistory moodData={filteredMoodLogs} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MoodPage;
