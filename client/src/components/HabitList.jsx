// components/HabitList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HabitItem from './HabitItem';
import './Habit.css';

function HabitList({ onEdit }) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/habits');
      setHabits(res.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/habits/${id}`);
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  return (
    <div className="habit-list">
      <h2>Your Habits</h2>
      {habits.length === 0 ? (
        <p>No habits yet.</p>
      ) : (
        habits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onEdit={onEdit}
            onDelete={deleteHabit}
          />
        ))
      )}
    </div>
  );
}

export default HabitList;
