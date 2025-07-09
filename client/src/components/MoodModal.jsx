import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import './MoodModal.css';

function MoodModal({ onClose }) {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState(null); // "success" or "error"
  const [message, setMessage] = useState('');

  const moods = [
    { emoji: '😢', label: 'Sad' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😊', label: 'Content' },
    { emoji: '😁', label: 'Happy' },
    { emoji: '😄', label: 'Excited' },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) {
    setStatus("error");
    setMessage("Please select a mood before submitting.");
    return;
  }

    try {
        const moodIndex = moods.findIndex(m => m.label === selectedMood);
        const moodValue = moodIndex !== -1 ? moodIndex + 1 : 3; // Default to 3 if no match

        await axios.post("/api/mood-logs", {
        mood: moodValue,
        note,
        });

        setStatus("success");
        setMessage("Mood submitted successfully!");

        setTimeout(() => {
        setStatus(null);
        setMessage("");
        onClose(); // Close the modal after short delay
        }, 1500);

    } catch (error) {
        console.error("Error submitting mood:", error);
        if (error.response?.data?.error === "You've already checked in today") {
            setStatus('error');
            setMessage("You've already checked in today 🌼 Come back tomorrow!");
        } else {
            setStatus('error');
            setMessage("Something went wrong. Please try again.");
        }
    }
};


  return (
    <div className="modal-backdrop">
      <div className="mood-modal">
        <h2>Daily Check-In</h2>
        {status && (
          <p style={{ color: status === 'success' ? 'green' : 'red', marginTop: '8px' }}>
            {message}
          </p>
        )}
        <p className="guided-note">
          How are you feeling today? Choose the mood that fits best 👇<br />
          No pressure — just take a moment for yourself 💜
        </p>

        <div className="mood-options">
          {moods.map(({ emoji, label }, index) => (
            <button
              key={index}
              className={`emoji-button ${selectedMood === label ? 'selected' : ''}`}
              onClick={() => setSelectedMood(label)}
            >
              <span className="emoji-label">{emoji} {label}</span>
            </button>
          ))}
        </div>

        <textarea
          placeholder="Want to say more? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

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
