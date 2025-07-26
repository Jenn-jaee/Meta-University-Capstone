import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { getMoodEmoji } from '../utils/moodUtils';
import './MoodModal.css';
import './MoodLogsModal.css';

function MoodLogsModal({ onClose }) {
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mood logs for the current week
  useEffect(() => {
    const fetchWeeklyMoodLogs = async () => {
      try {
        // Calculate the start of the current week (Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        // Fetch mood logs from the start of the week
        const response = await axios.get(`/api/mood-logs?from=${startOfWeek.toISOString()}`);
        setMoodLogs(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load mood logs. Please try again.');
        setLoading(false);
      }
    };

    fetchWeeklyMoodLogs();
  }, []);

  // Using the imported getMoodEmoji function from moodUtils.js

  // Format date to display day and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="modal-backdrop">
      <div className="mood-modal mood-logs-modal">
        <h2>This Week's Mood Logs</h2>

        {loading ? (
          <div className="loading">Loading mood logs...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : moodLogs.length === 0 ? (
          <div className="empty-state">
            <p>No mood logs recorded this week.</p>
            <p>Start logging your mood daily to see your entries here!</p>
          </div>
        ) : (
          <div className="mood-logs-container">
            {moodLogs.map((log) => (
              <div key={log.id} className="mood-log-item">
                <div className="mood-log-emoji">{getMoodEmoji(log.mood)}</div>
                <div className="mood-log-details">
                  <div className="mood-log-date">{formatDate(log.createdAt)}</div>
                  {log.note && <div className="mood-log-note">{log.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="submit-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoodLogsModal;
