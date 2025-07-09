import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import WelcomeModal from '../components/WelcomeModal';
import MoodModal from '../components/MoodModal';
import PlantGrid from '../components/PlantGrid';
import { growPlant } from '../api/plantAPI';
import './DashboardHome.css';

function DashBoardHome() {
  const navigate = useNavigate();

  // State for user info and modals
  const [displayName, setDisplayName] = useState('');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  // State for dashboard data
  const [todayMood, setTodayMood] = useState(null);
  const [plantStage, setPlantStage] = useState(1);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]);

  // Fetch user profile on initial load
  useEffect(() => {
    fetchUser();
  }, []);

  // After user profile is loaded, fetch other data
  useEffect(() => {
    if (displayName !== '') {
      fetchTodayMood();
      fetchPlantStage();
      fetchHabits();
      fetchHabitLogs();
      fetchJournalEntries();
    }
  }, [displayName]);

  // Fetches user profile details
  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user/me');
      const user = res.data;
      setDisplayName(user.displayName || '');
      setHasSeenWelcome(user.hasSeenWelcome || false);
      if (!user.displayName || !user.hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  // Fetches today's mood log (if already submitted)
  const fetchTodayMood = async () => {
    try {
      const res = await axios.get('/api/plant-growth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPlantStage(res.data.stage || 1);
    } catch (err) {
      console.error('Error fetching habits:', err);
    }
  };

  // Fetches today's habit logs (for checkbox display)
  const fetchHabitLogs = async () => {
    try {
      const res = await axios.get('/api/habit-logs/today');
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching habit logs:', err);
    }
  };

  // Fetches user's journal entries for display
  const fetchJournalEntries = async () => {
    try {
      const res = await axios.get('/api/journal');
      setEntries(res.data);
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };

  // Updates user profile after saving name via welcome modal
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

  // Converts mood value (1-5) into matching emoji
  const getMoodEmoji = (value) => {
    const moodMap = {
      1: '😢',
      2: '😐',
      3: '😊',
      4: '😁',
      5: '😄',
    };
    return moodMap[value] || '🙂';
  };

  return (
    <div className="dashboard-home-container">
      <header className="dashboard-header">
        <h2>
          {displayName && hasSeenWelcome
            ? `Welcome back to your wellness journey, ${displayName} 👋`
            : `Hi ${displayName || 'there'} 👋 Welcome to your wellness journey`}
        </h2>
      </header>

      <section className="dashboard-section grid-two">
        <div className="card mood-card">
          <div className="card-header">
            <h3>This Week’s Mood</h3>
            <a href="#">View All</a>
          </div>
          <p className="mood-text">
            {todayMood
              ? `${getMoodEmoji(todayMood.mood)} ${todayMood.note || 'Logged'}`
              : 'No mood logged today'}
          </p>

          <p className="growth-days">
            {todayMood ? '1 day of growth' : '0 days of growth'}
          </p>

          <div
            className={`dashboard-tile ${todayMood ? 'disabled-tile' : ''}`}
            onClick={() => {
              if (!todayMood) {
                setShowMoodModal(true);
              } else {
                alert("You’ve already checked in today 🌼 Come back tomorrow!");
              }
            }}
            title={todayMood ? "You've already checked in today" : "Click to log your mood for today"}
          >
            <h3>Log Mood</h3>
          </div>

          {showMoodModal && (
            <MoodModal
              onClose={() => setShowMoodModal(false)}
              onSuccess={async (newMood) => {
                setTodayMood(newMood);   //update mood immediately
                await growPlant();   // grow the plant after mood check-in
                await fetchPlantStage(); //fetch plant stage
                setShowMoodModal(false);
              }}
            />
          )}
        </div>

        <div className="card garden-card">
          <h3>Your Garden</h3>
          <PlantGrid stage={plantStage} />
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

      {showWelcomeModal && <WelcomeModal onSave={handleSaveDisplayName} />}
    </div>
  );
}

export default DashBoardHome;
