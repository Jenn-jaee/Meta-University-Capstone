import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determine if we're editing or creating a new habit
    const request = editingHabit
      ? axios.put(`/api/habits/${editingHabit.id}`, { title, description })
      : axios.post('/api/habits', { title, description });

    request
      .then(() => {
        // Show success message based on action
        toast.success(editingHabit ? 'Habit updated successfully' : 'Habit created successfully');

        // Trigger refresh of habit list and clear edit form
        onSuccess();
        clearEdit();
      })
      .catch(() => {
        toast.error('Failed to save habit');
      });
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <h3>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h3>

      <div className="form-group">
        <label htmlFor="habit-title">Habit Title</label>
        <input
          id="habit-title"
          type="text"
          placeholder="Enter habit title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="habit-description">Description (Optional)</label>
        <textarea
          id="habit-description"
          placeholder="Enter habit description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />
      </div>

      <div className="form-buttons">
        <button type="submit" style={{ backgroundColor: '#6c5ce7' }}>
          {editingHabit ? 'Update Habit' : 'Create Habit'}
        </button>
        {editingHabit && (
          <button type="button" onClick={clearEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default HabitForm;
