import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance.js';
import './Habit.css';

function HabitItem({ habit, onEdit, onDelete, onToggle, isCompleted }) {
    const [streak, setStreak] = useState(habit.streak);

    const handleToggle = () => {
    const newStatus = !isCompleted;

    // Optimistically update streak
    setStreak((prev) => newStatus ? prev + 1 : Math.max(prev - 1, 0));

    axiosInstance
    .post('/api/habit-logs', {
    habitId: habit.id,
    completed: newStatus,
    })
    .then(() => {
    if (onToggle) onToggle(habit.id, isCompleted);
    })
    .catch((error) => {
    console.error('Error logging habit completion:', error);
    setStreak((prev) => newStatus ? prev - 1 : prev + 1); // revert streak
    });
    };

    return (
    <div className="habit-card">
    <div className="habit-header">
    <h3>{habit.title}</h3>
    <label className="toggle-switch">
    <input
    type="checkbox"
    checked={isCompleted}
    onChange={handleToggle}
    />
    <span className="slider"></span>
    </label>
    </div>
    {habit.description && <p>{habit.description}</p>}
    <p className="habit-meta">
    Streak: {streak} | {habit.isActive ? 'Active' : 'Inactive'}
    </p>
    <div className="habit-actions">
    <button onClick={() => onEdit(habit)}>Edit</button>
    <button onClick={() => onDelete(habit.id)}>Delete</button>
    </div>
    </div>
    );
    }

export default HabitItem;
