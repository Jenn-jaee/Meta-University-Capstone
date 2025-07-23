import { useState, useEffect } from 'react';
import './Journal.css';
import { moodMap, moodOptions } from '../utils/moodUtils';
import { MoodIcons } from './MoodIcons';

function JournalForm({ onSubmit, editingEntry, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setMood(editingEntry.journalMood !== undefined ? moodMap[editingEntry.journalMood] : 'neutral');
    } else {
      setTitle('');
      setContent('');
      setMood('neutral');
    }
  }, [editingEntry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, journalMood: moodMap[mood] || 3 });
    if (!editingEntry) {
      setTitle('');
      setContent('');
      setMood('neutral');
    }
  };


  return (
    <div className="journal-form-container panel">
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
          <label className="mood-label">How are you feeling today?</label>
          <div className="mood-options">
            {moodOptions.map((m) => (
              <label
                key={m.value}
                className={`mood-option ${mood === m.value ? 'mood-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="mood"
                  value={m.value}
                  checked={mood === m.value}
                  onChange={(e) => setMood(e.target.value)}
                  className="mood-radio"
                />
                <span className="mood-icon">
                  {m.value === 'happy' && <MoodIcons.Happy />}
                  {m.value === 'excited' && <MoodIcons.Excited />}
                  {m.value === 'neutral' && <MoodIcons.Neutral />}
                  {m.value === 'anxious' && <MoodIcons.Anxious />}
                  {m.value === 'sad' && <MoodIcons.Sad />}
                  {m.value === 'angry' && <MoodIcons.Angry />}
                </span>
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
