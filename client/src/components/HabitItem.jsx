import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import './Habit.css';

function HabitItem({ habit, isCompleted, onEdit, onDelete, onToggle }) {
const [streak, setStreak] = useState(habit.streak || 0);
const [lastCompletedDate, setLastCompletedDate] = useState(habit.lastCompletedDate || null);
const [toggleDisabled, setToggleDisabled] = useState(false);

useEffect(() => {
// Check if last completed date is today
const today = new Date().toISOString().split('T')[0];
const lastDate = lastCompletedDate?.split('T')[0];
setToggleDisabled(lastDate === today);
}, [lastCompletedDate]);

const handleToggle = () => {
if (toggleDisabled) return; // prevent multiple streak increases per day

const newStatus = !isCompleted;

axios.post('/api/habit-logs', {
habitId: habit.id,
completed: newStatus,
})
.then((res) => {
const today = new Date().toISOString().split('T')[0];

if (newStatus) {
// Only increment if last update wasn't today
const last = lastCompletedDate?.split('T')[0];
if (last !== today) {
setStreak((prev) => prev + 1);
}
setLastCompletedDate(new Date().toISOString());
setToggleDisabled(true);
} else {
// Turning off today won't decrement streak
setToggleDisabled(false);
}

onToggle(habit.id, newStatus);
})
.catch((err) => {
console.error('Error toggling habit:', err);
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
Streak: {streak} — {habit.isActive ? 'Active' : 'Inactive'}
</p>
<div className="habit-actions">
<button onClick={() => onEdit(habit)}>Edit</button>
<button onClick={() => onDelete(habit.id)}>Delete</button>
</div>
</div>
);
}

export default HabitItem;
