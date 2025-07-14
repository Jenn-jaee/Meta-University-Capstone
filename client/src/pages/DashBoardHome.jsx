import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';
import WelcomeModal from '../components/WelcomeModal';
import MoodModal from '../components/MoodModal';
import PlantGrid from '../components/PlantGrid';
import { checkAndGrowPlant } from '../services/plantService';
import { calculateMoodStreak } from './MoodPage';
import ProgressRing from '../components/ProgressRing';
import { getWeeklyEngagement } from '../utils/engagement.js';
import './DashboardHome.css';

// ── Keep toast from firing twice for the same level ───────────────
function showGrowthToastOnce(level) {
  const last = localStorage.getItem('lastPlantStage');
  if (last !== String(level)) {
    toast.success(`🎉 Yay! Your plant reached stage ${level}!`, {
      id: 'plantGrewOnce',
    });
    localStorage.setItem('lastPlantStage', String(level));
  }
}
function DashBoardHome() {
  const navigate = useNavigate();
  const [engagementPercentage, setEngagementPercentage] = useState(0);


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
  const [streak, setStreak] = useState(0);

  // Fetch user engagement percentage on initial load
  useEffect(() => {
    getWeeklyEngagement().then(({ percentage }) => {
      const calculated = Math.min((percentage || 0) * 100, 100);
      setEngagementPercentage(calculated);
    }).catch(() => {
      setEngagementPercentage(0);
    });
  }, []);

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

  // Fetch all mood logs once, then calculate & store the current streak
  useEffect(() => {
    const fetchMoodLogs = async () => {
      try {
        const res = await axios.get('/api/mood-logs');
        const calculated = calculateMoodStreak(res.data);
        setStreak(calculated);
      } catch {
        toast.error('Unable to load mood logs.');
      }
    };

    fetchMoodLogs();
  }, []);

/* ───────────────────  ONE-TIME PLANT RECONCILE  ─────────────────── */
useEffect(() => {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  checkAndGrowPlant(userId).then((res) => {setPlantStage(res.level); showGrowthToastOnce(res.level);});
}, []);

/* ────────────────────────────────────────────────────────────────── */


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
    } catch {
      toast.error('Unable to load user.');
    }
  };

  // Fetches today's mood log (if already submitted)
  const fetchTodayMood = async () => {
    try {
      const res = await axios.get('/api/mood-logs/today');
      setTodayMood(res.data);
    } catch {
      setTodayMood(null);
    }
  };

  // Fetches current plant stage for garden view
  const fetchPlantStage = async () => {
    try {
      const res = await axios.get('/api/plant-growth/me');
      setPlantStage(res.data.level || 1); // update to use level
    } catch {
      toast.error('Unable to load plant stage.');
    }
  };

  // Fetches all user habits
  const fetchHabits = async () => {
    try {
      const res = await axios.get('/api/habits');
      setHabits(res.data);
    } catch {
      toast.error('Unable to load habits.');
    }
  };

  // Fetches today's habit logs (for checkbox display)
  const fetchHabitLogs = async () => {
    try {
      const res = await axios.get('/api/habit-logs/today');
      setLogs(res.data);
    } catch {
      toast.error('Unable to load habit logs.');
    }
  };

  // Fetches user's journal entries for display
  const fetchJournalEntries = async () => {
    try {
      const res = await axios.get('/api/journal');
      setEntries(res.data);
    } catch {
      toast.error('Unable to load journal entries.');
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
    } catch {
      toast.error('Failed to save display name.');
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
            {streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} of growth` : '0 days of growth'}
          </p>

          <div
            className={`dashboard-tile ${todayMood ? 'disabled-tile' : ''}`}
            onClick={() => {
              if (!todayMood) {
                setShowMoodModal(true);
              } else {
                toast("You’ve already checked in today 🌼 Come back tomorrow!");
              }
            }}
            title={todayMood ? "You've already checked in today" : "Click to log your mood for today"}
          >
            <h3>Log Mood</h3>
          </div>

          {showMoodModal && (
            <MoodModal
              onClose={() => setShowMoodModal(false)}
              onSuccess={({ mood, note, newLevel }) => {
              setTodayMood({ mood, note });

              if (newLevel) {
                setPlantStage(newLevel);
                toast.success(`🎉 Yay! Your plant reached stage ${newLevel}!`, {
                  id: 'plantGrewModal',
                });
              } else {
                fetchPlantStage();
              }

              setShowMoodModal(false);
            }}

            />
          )}
        </div>

        <div className="card garden-card">
          <h3>Your Garden</h3>

          <PlantGrid stage={plantStage} />
          <h4>Weekly Engagement</h4>
          <ProgressRing percentage={engagementPercentage} />
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
        <div className="action-tile">📊 View Mood Trends</div>
        <div className="action-tile">✅ View Habits</div>
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
