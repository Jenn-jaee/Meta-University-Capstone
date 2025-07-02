// pages/DashBoardHome.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import './DashboardHome.css';

function DashBoardHome() {
  const [moods, setMoods] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchMoods();
    fetchHabits();
    fetchLogs();
    fetchEntries();
  }, []);

  const fetchMoods = () => {
    axios.get('/api/moods')
      .then((res) => {
        const all = res.data || [];
        setMoods(all);
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = all.find((m) => m.date.startsWith(today));
        setTodayMood(todayEntry);
      })
      .catch((err) => console.error('Error fetching moods:', err));
  };

  const fetchHabits = () => {
    axios.get('/api/habits')
      .then((res) => setHabits(res.data))
      .catch((err) => console.error('Error fetching habits:', err));
  };

  const fetchLogs = () => {
    axios.get('/api/habit-logs/today')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error('Error fetching logs:', err));
  };

  const fetchEntries = () => {
    axios.get('/api/journal')
      .then((res) => setEntries(res.data))
      .catch((err) => console.error('Error fetching entries:', err));
  };

  return (
    <div className="dashboard-home-container">
      <header className="dashboard-header">
        <h2>Hi Jennifer 👋</h2>
        <p>Welcome back to your wellness journey</p>
      </header>

      <section className="dashboard-section grid-two">
        <div className="card mood-card">
          <div className="card-header">
            <h3>This Week’s Mood</h3>
            <a href="#">View All</a>
          </div>
          <p className="mood-text">
            {todayMood ? `${todayMood.emoji || '🙂'} ${todayMood.note || 'Logged'}` : 'No mood logged today'}
          </p>
          <p className="growth-days">
            {moods.length} day{moods.length !== 1 ? 's' : ''} of growth
          </p>
        </div>

        <div className="card garden-card">
          <h3>Your Garden</h3>
          <div className="chart-placeholder">🌱 Growing beautifully!</div>
          <p className="growth-days">12 days of growth</p>
        </div>
      </section>

      <section className="dashboard-section habits-section">
        <div className="section-header">
          <h3>Today’s Habits</h3>
          <a href="#">Manage Habits</a>
        </div>
        <div className="habits-list">
          {habits.map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id);
            const isCompleted = log?.completed || false;
            return (
              <div key={habit.id} className="habit">
                {habit.title} <input type="checkbox" checked={isCompleted} readOnly />
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section quick-actions">
        <div className="action-tile">📝 Add Journal Entry</div>
        <div className="action-tile">📊 Log Mood</div>
        <div className="action-tile">✅ Track Habits</div>
      </section>

      <section className="dashboard-section recent-entries">
        <div className="section-header">
          <h3>Recent Journal Entries</h3>
          <a href="#">View All</a>
        </div>
        {Array.isArray(entries) && entries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="entry">
                <p className="entry-date">{new Date(entry.date).toLocaleDateString()}</p>
                <p className="entry-snippet">{entry.body?.slice(0, 100)}...</p>
                <span className="emoji">{entry.emoji || '📝'}</span>
            </div>
        ))}
      </section>
    </div>
  );
}

export default DashBoardHome;
