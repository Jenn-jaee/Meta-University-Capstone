import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.js';
import HabitItem from './HabitItem';
import { FiInfo, FiLoader } from 'react-icons/fi'; // Import icons for better UI
import './Habit.css';
import toast from 'react-hot-toast';

function HabitList({ onEdit }) {
  // State management for habits, logs, and loading status
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state for better UX

  // Fetch habits and logs when component mounts
  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);

  /**
   * Fetches all habits for the current user
   * Shows loading state during fetch and handles errors with toast notifications
   */
  const fetchHabits = () => {
    setLoading(true); // Show loading state while fetching
    axios.get('/api/habits')
      .then((res) => {
        setHabits(res.data);
        setLoading(false); // Hide loading state on success
      })
      .catch(() => {
        toast.error('Failed to load habits'); // User-friendly error handling
        setLoading(false); // Hide loading state on error
      });
  };

  /**
   * Fetches today's habit logs to determine which habits are completed
   * Uses toast notifications for error handling instead of console.error
   */
  const fetchLogs = () => {
    axios.get('/api/habit-logs/today')
      .then((res) => setLogs(res.data))
      .catch(() => toast.error('Failed to load habit logs'));
  };

  /**
   * Handles toggling a habit's completion status
   * Uses optimistic UI updates for better user experience
   * Reverts changes if the server request fails
   *
   * @param {string} habitId - The ID of the habit to toggle
   * @param {boolean} isCompleted - The current completion status
   */
  const handleToggle = (habitId, isCompleted) => {
    // Optimistically update local log for immediate UI feedback
    setLogs((prevLogs) => {
      const existing = prevLogs.find((log) => log.habitId === habitId);
      if (existing) {
        return prevLogs.map((log) =>
          log.habitId === habitId ? { ...log, completed: !isCompleted } : log
        );
      } else {
        return [...prevLogs, { habitId, completed: !isCompleted }];
      }
    });

    // Send request to server
    axios.post('/api/habit-logs', {
      habitId,
      completed: !isCompleted,
    }).catch(() => {
      toast.error('Failed to update habit status');

      // Revert optimistic update on error to maintain data consistency
      setLogs((prevLogs) => {
        const existing = prevLogs.find((log) => log.habitId === habitId);
        if (existing) {
          return prevLogs.map((log) =>
            log.habitId === habitId ? { ...log, completed: isCompleted } : log
          );
        } else {
          return prevLogs.filter((log) => log.habitId !== habitId);
        }
      });
    });
  };

  /**
   * Deletes a habit by ID
   * Updates UI immediately and shows success/error notifications
   *
   * @param {string} id - The ID of the habit to delete
   */
  const deleteHabit = (id) => {
    axios.delete(`/api/habits/${id}`)
      .then(() => {
        // Remove habit from state immediately for responsive UI
        setHabits((prev) => prev.filter((h) => h.id !== id));
        toast.success('Habit deleted successfully');
      })
      .catch(() => {
        toast.error('Failed to delete habit');
      });
  };

  return (
    <div className="habit-list">
      <h2>Your Habits</h2>
      <p className="habit-description">
        <FiInfo className="info-icon" />
        Track your daily habits and build streaks by toggling them active each day.
        Your streak will only reset if you don't mark a habit as completed for a day.
      </p>

      {loading ? (
        <p className="loading-state"><FiLoader className="loading-icon spin" /> Loading habits...</p>
      ) : habits.length === 0 ? (
        <p>No habits yet. Create one to get started!</p>
      ) : (
        <div className="habits-container">
          {habits.slice(0, 5).map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id);
            const isCompleted = log?.completed || false;

            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                onEdit={onEdit}
                onDelete={deleteHabit}
                onToggle={() => handleToggle(habit.id, isCompleted)}
              />
            );
          })}
          {habits.length > 5 && (
            <p className="habit-note">Showing your top 5 habits. Consider focusing on these before adding more.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HabitList;
