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
    // Force a small delay to ensure the component fully remounts
    setTimeout(() => {
      setRefreshFlag((prev) => !prev);
    }, 10);
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
