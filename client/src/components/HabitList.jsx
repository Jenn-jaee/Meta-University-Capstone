import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance.js';
import HabitItem from './HabitItem';
import './Habit.css';

function HabitList({ onEdit }) {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);

  const fetchHabits = () => {
    axios.get('/api/habits')
      .then((res) => setHabits(res.data))
      .catch((err) => console.error('Error fetching habits:', err));
  };

  const fetchLogs = () => {
    axios.get('/api/habit-logs/today')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error('Error fetching logs:', err));
  };

  const handleToggle = (habitId, isCompleted) => {
    // Optimistically update local log
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
    }).catch((err) => {
      console.error('Error toggling log:', err);

      // Revert optimistic update on error
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


  const deleteHabit = (id) => {
    axios.delete(`/api/habits/${id}`)
      .then(() => setHabits((prev) => prev.filter((h) => h.id !== id)))
      .catch((err) => console.error('Error deleting habit:', err));
  };

  return (
    <div className="habit-list">
      <h2>Your Habits</h2>
      {habits.length === 0 ? (
        <p>No habits yet.</p>
      ) : (
        habits.map((habit) => {
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
        })
      )}
    </div>
  );
}

export default HabitList;
