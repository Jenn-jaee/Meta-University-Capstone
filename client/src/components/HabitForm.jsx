// components/HabitForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Habit.css';

function HabitForm({ editingHabit, onSuccess, clearEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [editingHabit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await axios.put(`http://localhost:3001/api/habits/${editingHabit.id}`, {
          title,
          description,
        });
      } else {
        await axios.post('http://localhost:3001/api/habits', {
          title,
          description,
        });
      }
      onSuccess(); // Refresh the habit list
      clearEdit(); // Clear editing state
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <h2>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h2>
      <input
        type="text"
        placeholder="Habit Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Optional Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">{editingHabit ? 'Update Habit' : 'Create Habit'}</button>
      {editingHabit && <button onClick={clearEdit}>Cancel</button>}
    </form>
  );
}

export default HabitForm;
