import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import './MoodModal.css';

function MoodModal({ onClose, onSuccess }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [message, setMessage] = useState('');

  // List of available moods with labels
  const moods = [
    { emoji: '😢', label: 'Sad' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😊', label: 'Content' },
    { emoji: '😁', label: 'Happy' },
    { emoji: '😄', label: 'Excited' },
  ];

  // Handles form submission for mood check-in
  const handleSubmit = async () => {
    // Prevent submission if no mood is selected
    if (!selectedMood) {
      setStatus('error');
      setMessage('Please select a mood before submitting.');
      return;
    }

    try {

      // Convert selected mood label to numeric value (1–5)
      const moodIndex = moods.findIndex(m => m.label === selectedMood);
      const moodValue = moodIndex !== -1 ? moodIndex + 1 : 3; // Default to 3 if no match

      // Send mood log to backend
      await axios.post('/api/mood-logs', {
        mood: moodValue,
        note,
      });


      // Trigger plant growth after mood log
      const growRes = await axios.post('/api/plant-growth/grow');

      // Show success message
      setStatus('success');
      setMessage('Mood submitted successfully!');

      // Call onSuccess with submitted mood so dashboard can update immediately
      setTimeout(() => {
        onSuccess({ mood: moodValue, note });
      }, 1000);
    } catch (err) {
      // Handle duplicate check-in error
      if (err.response?.status === 400 && err.response?.data?.error?.includes('already')) {
        setStatus('error');
        setMessage("You've already checked in today. Come back tomorrow.");
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="mood-modal">
        <h2>Daily Check-In</h2>

        {/* Show success or error messages */}
        {status && (
          <p style={{ color: status === 'success' ? 'green' : 'red' }}>
            {message}
          </p>
        )}

        <p className="guided-note">
          How are you feeling today? Choose the mood that fits best. No pressure — just take a moment for yourself.
        </p>

        {/* Mood options */}
        <div className="mood-options">
          {moods.map(({ emoji, label }) => (
            <button
              key={label}
              className={`emoji-button ${selectedMood === label ? 'selected' : ''}`}
              onClick={() => setSelectedMood(label)}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Optional text input for notes */}
        <textarea
          placeholder="Want to say more? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Action buttons */}
        <div className="modal-actions">
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoodModal;
