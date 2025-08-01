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

        // Fetch user data to get the current streak from server
        const userRes = await axios.get('/api/user/me');
        if (userRes.data && userRes.data.currentStreak !== undefined) {
          setStreak(userRes.data.currentStreak);
        }

        // Explicitly fetch from mood logs endpoint to ensure we're using mood log data
        const res = await axios.get('/api/mood-logs');
        const data = res.data;

        if (data && data.length > 0) {
          // Sort data by date (newest first)
          const sortedData = [...data].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );

          setAllMoodLogs(sortedData);

          // Initialize with current period
          initializeDateRange(sortedData, timeFilter);
        } else {
          // Use fallback data if no data is returned
          setAllMoodLogs(fallbackData);
          initializeDateRange(fallbackData, timeFilter);
        }

        setLoading(false);
      } catch (err) {
        // Error silently handled - use fallback data if API call fails
        setAllMoodLogs(fallbackData);
        setStreak(calculateMoodStreak(fallbackData)); // Fallback to client calculation if server fetch fails
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
    let endDate = new Date(now);

    switch (filter) {
      case 'week':
        // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const currentDay = now.getDay();

        // Calculate days since last Monday (if today is Monday, this will be 0)
        const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

        // Set start date to Monday of current week
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysSinceMonday);
        startDate.setHours(0, 0, 0, 0); // Start of Monday

        // Set end date to Sunday of current week
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Sunday
        endDate.setHours(23, 59, 59, 999); // End of Sunday

        // If end date is in the future, cap it at today
        if (endDate > now) {
          endDate = now;
        }
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
        // Default to current week (Monday-Sunday)
        const defaultCurrentDay = now.getDay();
        const defaultDaysSinceMonday = defaultCurrentDay === 0 ? 6 : defaultCurrentDay - 1;

        startDate = new Date(now);
        startDate.setDate(now.getDate() - defaultDaysSinceMonday);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        if (endDate > now) {
          endDate = now;
        }
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
    let newStartDate, newEndDate;

    switch (timeFilter) {
      case 'week':
        // Go to previous Monday
        newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() - 7); // Go back 7 days to previous Monday
        newStartDate.setHours(0, 0, 0, 0);

        // Set end date to Sunday of that week
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6); // Sunday
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() - 30);
        newStartDate.setHours(0, 0, 0, 0);

        newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() - 30);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        newStartDate = new Date(currentStartDate);
        newStartDate.setFullYear(newStartDate.getFullYear() - 1);
        newStartDate.setHours(0, 0, 0, 0);

        newEndDate = new Date(currentEndDate);
        newEndDate.setFullYear(newEndDate.getFullYear() - 1);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        // Default to previous week
        newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() - 7);
        newStartDate.setHours(0, 0, 0, 0);

        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        newEndDate.setHours(23, 59, 59, 999);
    }

    setCurrentStartDate(newStartDate);
    setCurrentEndDate(newEndDate);
    setCanGoForward(true); // Now we can go forward
  };

  // Navigate to next period
  const goToNextPeriod = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let newStartDate, newEndDate;

    switch (timeFilter) {
      case 'week':
        // Go to next Monday
        newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() + 7); // Go forward 7 days to next Monday
        newStartDate.setHours(0, 0, 0, 0);

        // Set end date to Sunday of that week
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6); // Sunday
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() + 30);
        newStartDate.setHours(0, 0, 0, 0);

        newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + 30);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        newStartDate = new Date(currentStartDate);
        newStartDate.setFullYear(newStartDate.getFullYear() + 1);
        newStartDate.setHours(0, 0, 0, 0);

        newEndDate = new Date(currentEndDate);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        newEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        // Default to next week
        newStartDate = new Date(currentStartDate);
        newStartDate.setDate(newStartDate.getDate() + 7);
        newStartDate.setHours(0, 0, 0, 0);

        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        newEndDate.setHours(23, 59, 59, 999);
    }

    // If the new end date is in the future, cap it at today
    if (newEndDate > now) {
      newEndDate = now;
    }

    // If the new start date is in the future, don't navigate
    if (newStartDate > now) {
      return;
    }

    // If we're navigating to the current week, disable forward navigation
    const currentDay = now.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const currentWeekMonday = new Date(now);
    currentWeekMonday.setDate(now.getDate() - daysSinceMonday);
    currentWeekMonday.setHours(0, 0, 0, 0);

    if (newStartDate.getTime() === currentWeekMonday.getTime()) {
      setCanGoForward(false);
    } else {
      setCanGoForward(true);
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
