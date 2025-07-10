import { useState, useEffect } from 'react';
import './Journal.css';

function JournalForm({ onSubmit, editingEntry, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setMood(editingEntry.mood?.value !== undefined ? editingEntry.mood.value.toString() : 'neutral'); // Convert to string to match the options

    } else {
      setTitle('');
      setContent('');
      setMood('neutral');
    }
  }, [editingEntry]);

  const handleSubmit = (e) => {

    e.preventDefault();
    const moodMap = {
    happy: 5,
    excited: 4,
    neutral: 3,
    anxious: 2,
    sad: 1,
    angry: 0
    };

    // Check if the user has selected a mood
    console.debug("Selected mood:", mood); //for debugging
    console.debug("Mapped moodValue:", moodMap[mood]); //for debugging


    onSubmit({ title, content, moodValue: moodMap[mood] || 3 });
    if (!editingEntry) {
        setTitle('');
        setContent('');
        setMood('neutral');
        }
    };

  const journalmoods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' }
  ];

  return (
    <div className="journal-form-container">
      <h2 className="journal-form-title">
        {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
      </h2>
      <form onSubmit={handleSubmit} className="journal-form">
        <input
          type="text"
          placeholder="Give your entry a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="journal-input"
        />

        <textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="journal-textarea"
        />

        <div className="mood-selector">
          <label className="mood-label">How are you feeling?</label>
          <div className="mood-options">
            {journalmoods.map((m) => (
              <label key={m.value} className="mood-option">
                <input
                  type="radio"
                  name="mood"
                  value={m.value}
                  checked={mood === m.value}
                  onChange={(e) => setMood(e.target.value)}
                  className="mood-radio"
                />
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-text">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingEntry ? 'Update Entry' : 'Save Entry'}
          </button>

          {editingEntry && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default JournalForm;
