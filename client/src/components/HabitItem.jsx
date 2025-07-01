// components/HabitItem.jsx
import React from 'react';
import './Habit.css';

function HabitItem({ habit, onEdit, onDelete }) {
  return (
    <div className="habit-card">
      <h3>{habit.title}</h3>
      {habit.description && <p>{habit.description}</p>}
      <p className="habit-meta">
        Streak: {habit.streak} | {habit.isActive ? 'Active' : 'Inactive'}
      </p>
      <div className="habit-actions">
        <button onClick={() => onEdit(habit)}>Edit</button>
        <button onClick={() => onDelete(habit.id)}>Delete</button>
      </div>
    </div>
  );
}

export default HabitItem;
