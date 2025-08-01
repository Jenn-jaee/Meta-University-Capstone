import { useState } from 'react';
import axios from '../api/axiosInstance';
import { FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';


function HabitItem({ habit, isCompleted, onEdit, onDelete, onToggle }) {
  // Local state for streak count and loading status
  const [streak, setStreak] = useState(habit.streak || 0);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = () => {
    // Prevent multiple clicks during loading
    if (isLoading) return;

    setIsLoading(true);
    const newStatus = !isCompleted;

    axios.post('/api/habit-logs', {
      habitId: habit.id,
      completed: newStatus,
    })
    .then((res) => {
      // Update streak from server response to ensure accuracy
      if (res.data.streak !== undefined) {
        setStreak(res.data.streak);
      }

      onToggle(habit.id, newStatus);
      setIsLoading(false);
    })
    .catch(() => {
      // Silent fail - error is already handled in HabitList component
      setIsLoading(false); // Reset loading state even on error
    });
  };

  const formatStreak = (count) => {
    if (count <= 0) return 'No streak yet';
    return `🔥 ${count} day${count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="habit-card">
      <div className="habit-header">
        <h3>{habit.title}</h3>
        <div className="toggle-container">
          {isCompleted && <FiCheckCircle className="check-icon" />}
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={handleToggle}
              disabled={isLoading}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {habit.description && <p>{habit.description}</p>}

      <p className="habit-meta">
        Streak: {formatStreak(streak)}
        {!habit.isActive && <span className="inactive-badge"> • Inactive</span>}
      </p>

      <div className="habit-actions">
        <div className="left-actions">
          <button onClick={() => onEdit(habit)} className="icon-button">
            <FiEdit2 className="button-icon" /> Edit
          </button>
        </div>
        <div className="right-actions">
          <button onClick={() => onDelete(habit.id)} className="delete-button icon-button">
            <FiTrash2 className="button-icon" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default HabitItem;
