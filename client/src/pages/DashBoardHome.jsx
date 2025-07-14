// pages/DashBoardHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import WelcomeModal from '../components/WelcomeModal';
import MoodModal from '../components/MoodModal';

import './DashboardHome.css';

function DashBoardHome() {
  const [moods, setMoods] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/user/me');
        const user = res.data;
        setUserId(user.id);
        setDisplayName(user.displayName || '');
        setHasSeenWelcome(user.hasSeenWelcome || false);
        if (!user.displayName || !user.hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMoods();
      fetchHabits();
      fetchLogs();
      fetchEntries();
    }
  }, [userId]);

  const handleSaveDisplayName = async (name) => {
    try {
      const res = await axios.patch('/api/user/profile', {
        displayName: name,
        hasSeenWelcome: true,
      });
      setDisplayName(res.data.displayName);
      setHasSeenWelcome(true);
      setShowWelcomeModal(false);
    } catch (err) {
      console.error('Failed to save display name:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserId(null);
    setDisplayName('');
    setTodayMood(null);
    setMoods([]);
    setHabits([]);
    setLogs([]);
    setEntries([]);
    navigate('/');
  };

  const fetchMoods = () => {
  axios.get('/api/moods')
    .then((res) => {
      const all = res.data || [];
      const today = new Date().toISOString().split('T')[0];

      // Filter moods only for the current user
      const userMoods = all.filter((m) => m.userId === userId);

      // Check if user already submitted today
      const todayEntry = userMoods.find((m) =>
        m.date.startsWith(today)
      );

      setMoods(userMoods);
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

  const handleMoodSubmit = (selectedMoodValue) => {
    const token = localStorage.getItem('token');
    axios.post('/api/mood-logs', {
      moodValue: selectedMoodValue
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        console.log("Mood submitted successfully:", response.data);
        fetchMoods(); // Refresh mood
      })
      .catch((error) => {
        console.error("Failed to submit mood:", error);
      });
  };

  return (
    <div className="dashboard-home-container">
      <header className="dashboard-header">
        {displayName && hasSeenWelcome ? (
          <h2>Welcome back to your wellness journey, {displayName} 👋</h2>
        ) : (
          <h2>Hi {displayName || 'there'} 👋 Welcome to your wellness journey</h2>
        )}
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
          <div
            className={`dashboard-tile ${todayMood ? 'disabled-tile' : ''}`}
            onClick={() => {
              if (todayMood) {
                alert("You’ve already checked in today 🌼 Come back tomorrow!");
              } else {
                setShowMoodModal(true);
              }
            }}
            title={todayMood ? "You’ve already checked in today 🌼 Come back tomorrow!" : "Click to log your mood for today"}
          >
            <h3>Log Mood</h3>
          </div>

          {showMoodModal && (
            <MoodModal
              onClose={() => setShowMoodModal(false)}
              onSubmitMood={handleMoodSubmit}
            />
          )}
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
          <a onClick={() => navigate('/dashboard/habit')} className="link" style={{ cursor: 'pointer' }}>
            Manage Habits
          </a>
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
          <a onClick={() => navigate('/dashboard/journal')} className="link" style={{ cursor: 'pointer' }}>
            View All
          </a>
        </div>
        {Array.isArray(entries) && entries.slice(0, 3).map((entry) => (
          <div key={entry.id} className="entry">
            <p className="entry-date">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
            <p className="entry-snippet">
              {entry.content?.slice(0, 100)}...
            </p>
            <span className="emoji">
              {entry.mood?.emoji || '📝'}
            </span>
          </div>
        ))}
      </section>

      {showWelcomeModal && (<WelcomeModal onSave={handleSaveDisplayName} />)}
    </div>
  );
}

export default DashBoardHome;
