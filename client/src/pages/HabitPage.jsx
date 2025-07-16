// pages/HabitPage.jsx
import React, { useState } from 'react';
import HabitForm from '../components/HabitForm';
import HabitList from '../components/HabitList';
import '../components/Habit.css';

function HabitPage() {
  const [editingHabit, setEditingHabit] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleEdit = (habit) => {
    setEditingHabit(habit);
  };

  const clearEdit = () => {
    setEditingHabit(null);
  };

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  return (
    <div className="habit-page">
      <h2>Manage Your Habits</h2>
      <HabitForm
        editingHabit={editingHabit}
        onSuccess={triggerRefresh}
        clearEdit={clearEdit}
      />
      <HabitList
        key={refreshFlag}
        onEdit={handleEdit}
      />
    </div>
  );
}

export default HabitPage;
