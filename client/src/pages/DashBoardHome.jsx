import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { FaBook, FaChartLine, FaList, FaCalendarAlt, FaEdit, FaEye } from 'react-icons/fa';
import WelcomeModal from '../components/WelcomeModal';
import MoodModal from '../components/MoodModal';
import MoodLogsModal from '../components/MoodLogsModal';
import PlantGrid from '../components/PlantGrid';
import { checkAndGrowPlant } from '../services/plantService';
import ProgressRing from '../components/ProgressRing';
import { getWeeklyEngagement } from '../utils/engagement.js';
import { calculateMoodStreak, getMoodEmoji } from '../utils/moodUtils';
import RecommendationBanner from '../components/RecommendationBanner.jsx';
import GuideTipModal from '../components/GuideTipModal.jsx';
import './DashboardHome.css';

// Helper function to get action text based on banner tag
function getActionTextForBanner(tag) {
  // Default action text
  let actionText = "Take Action";

  // Journal-related banners
  if (tag === 'journal_gap' || tag === 'no_journals_yet') {
    actionText = "Write Journal";
  }
  // Mood-related banners
  else if (tag === 'mood_drop' || tag === 'low_mood') {
    actionText = "Log Mood";
  }
  else if (tag === 'mood_swing' || tag === 'mood_volatility') {
    actionText = "View Mood Trends";
  }
  // Streak-related banners
  else if (tag === 'streak_reset') {
    actionText = "Start New Streak";
  }
  else if (tag.includes('milestone-streak')) {
    actionText = "View Streak";
  }
  // Habit-related banners
  else if (tag.includes('habit')) {
    actionText = "Check Habits";
  }
  // Distress-related banners
  else if (tag === 'distress_text') {
    actionText = "Write Journal";
  }
  // Positive reflection
  else if (tag === 'positive_reflection') {
    actionText = "Continue Journey";
  }

  return actionText;
}

// Keep toast from firing twice for the same level
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
  const [showMoodLogsModal, setShowMoodLogsModal] = useState(false);

  // State for dashboard data
  const [todayMood, setTodayMood] = useState(null);
  const [plantStage, setPlantStage] = useState(1);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [banner, setBanner] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showGuideTip, setShowGuideTip] = useState(false);
  const [guideTipType, setGuideTipType] = useState(null);

  // Fetch user engagement percentage on initial load and when mood or journal entries change
  const fetchEngagementPercentage = () => {
    getWeeklyEngagement().then((data) => {
      const calculated = Math.min((data.percentage || 0) * 100, 100);
      setEngagementPercentage(calculated);
    }).catch(() => {
      setEngagementPercentage(0);
    });
  };

  useEffect(() => {
    fetchEngagementPercentage();
  }, [todayMood, entries]); // Re-fetch when mood or journal entries change

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


  // Fetch mood logs and calculate weekly logs count and streak
  // This will run on initial load and whenever todayMood changes
  useEffect(() => {
    const fetchLogsAndCalculateStreak = async () => {
      try {
        // Get all mood logs (we only need mood logs for streak calculation)
        const moodRes = await axios.get('/api/mood-logs');
        const moodLogs = moodRes.data;

        // Calculate the start of the current week (Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        // Count unique days with mood logs this week
        const weeklyLogsSet = new Set(
          moodLogs
            .filter(log => new Date(log.createdAt) >= startOfWeek)
            .map(log => new Date(log.createdAt).toDateString())
        );

        setWeeklyLogs(weeklyLogsSet.size);

        // Calculate streak using only mood logs
        const currentStreak = calculateMoodStreak(moodLogs);
        setStreak(currentStreak);

      } catch (error) {
        toast.error('Unable to load logs.');
        setWeeklyLogs(0);
        setStreak(0);
      }
    };

    fetchLogsAndCalculateStreak();
  }, [todayMood]); // Re-run when todayMood changes

  // One-time plant reconcile
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    checkAndGrowPlant(userId).then((res) => {
      setPlantStage(res.level);
      showGrowthToastOnce(res.level);
    });
  }, []);

  // Function to load recommendation banner
  const loadBanner = () => {
    // Don't fetch a new banner if one was recently dismissed
    const lastDismissTime = localStorage.getItem('lastBannerDismissTime');
    const lastDismissedTag = localStorage.getItem('lastDismissedBannerTag');
    const now = Date.now();

    // If a banner was dismissed in the last 2 hours, don't show a new one
    if (lastDismissTime && (now - parseInt(lastDismissTime)) < 2 * 60 * 60 * 1000) {
      setShowBanner(false);
      return;
    }

    axios
      .get('/api/recommendation')
      .then((res) => {
        if (res.data?.banner) {
          setBanner(res.data.banner);
          setShowBanner(true);
        } else {
          setBanner(null);
          setShowBanner(false);
        }
      })
      .catch(() => {
        setBanner(null);
        setShowBanner(false);
      });
  };

  // Banner fetch on initial load and when data changes
  useEffect(() => {
    loadBanner();
  }, [todayMood, entries, logs]); // Refresh when any data changes

  // Fetches user profile details
  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/user/me');
      const user = res.data;
      setDisplayName(user.displayName || '');
      setHasSeenWelcome(user.hasSeenWelcome || false);
      setStreak(user.currentStreak || 0); // Use server's streak value
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

  // Using the imported getMoodEmoji function from moodUtils.js

  return (
    <div className="dashboard-home-container">
      {showBanner && banner && (
        <RecommendationBanner
          title={banner.tag}
          description={banner.message}
          onClose={() => {
            setShowBanner(false);
            // Add API call to record dismissal
            axios.post('/api/recommendation/dismiss', { tag: banner.tag })
              .catch(() => {
                // Silently handle error - banner dismissal is non-critical
              });
          }}
          onAction={() => {
            // Show guide tip modal instead of navigating directly
            setGuideTipType(banner.tag);
            setShowGuideTip(true);
          }}
          actionText="View Guide"
        />
      )}

      {/* Guide Tip Modal */}
      {showGuideTip && (
        <GuideTipModal
          type={guideTipType}
          onClose={() => {
            setShowGuideTip(false);

            // After closing the guide, navigate to the appropriate page based on the banner type
            const tag = guideTipType;

            // Journal-related banners
            if (tag === 'journal_gap' || tag === 'no_journals_yet') {
              navigate('/dashboard/journal/new');
            }
            // Mood-related banners
            else if (tag === 'mood_drop' || tag === 'low_mood' || tag === 'mood_swing' || tag === 'mood_volatility') {
              if (!todayMood) {
                setShowMoodModal(true);
              } else {
                navigate('/dashboard/mood');
              }
            }
            // Streak-related banners
            else if (tag === 'streak_reset' || tag.includes('milestone-streak')) {
              navigate('/dashboard/mood');
            }
            // Habit-related banners
            else if (tag.includes('habit')) {
              navigate('/dashboard/habit');
            }
            // Distress-related banners
            else if (tag === 'distress_text') {
              navigate('/dashboard/journal/new');
            }

            // Dismiss the banner after viewing the guide
            setShowBanner(false);
            axios.post('/api/recommendation/dismiss', { tag })
              .catch(() => {
                // Silently handle error - banner dismissal is non-critical
              });
          }}
        />
      )}

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
            <h3>This Week's Mood</h3>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setShowMoodLogsModal(true);
            }}>View All</a>
          </div>
          <p className="mood-text">
            {todayMood
              ? `${getMoodEmoji(todayMood.mood)} ${todayMood.note || 'Logged'}`
              : 'No mood logged today'}
          </p>

          <p className="growth-days">
            {`${weeklyLogs}/7 mood logs this week`}
          </p>

          {streak > 0 && (
            <p className="streak-count">
              🔥 {streak} day{streak !== 1 ? 's' : ''} streak
            </p>
          )}

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
              loadBanner(); // Refresh banner after success
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
          <p>Aim to get 65% and above engagement to grow plant weekly</p>
        </div>
      </section>

      <section className="dashboard-section habits-section">
        <div className="section-header">
          <h3>Today's Habits</h3>
          <a onClick={() => navigate('/dashboard/habit')} className="link" style={{ cursor: 'pointer' }}>
            Manage Habits
          </a>
        </div>
        <div className="habits-list">
          {habits.length === 0 ? (
            <p>No habits created yet. Add some habits to track your progress!</p>
          ) : (
            habits.slice(0, 5).map((habit) => {
              const log = logs.find((l) => l.habitId === habit.id);
              const isCompleted = log?.completed || false;
              return (
                <div key={habit.id} className="habit">
                  <span className="habit-title">{habit.title}</span>
                  <span className="habit-streak">{habit.streak > 0 ? `🔥 ${habit.streak}` : ''}</span>
                  <input type="checkbox" checked={isCompleted} readOnly />
                </div>
              );
            })
          )}
          {habits.length > 5 && (
            <div className="more-habits">
              <a onClick={() => navigate('/dashboard/habit')} className="link">
                +{habits.length - 5} more habits
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-section quick-actions">
        <div className="action-tile" onClick={() => navigate('/dashboard/journal')}>
          <FaBook className="action-icon" /> Add Journal Entry
        </div>
        <div className="action-tile" onClick={() => navigate('/dashboard/mood')}>
          <FaChartLine className="action-icon" /> View Mood Trend
        </div>
        <div className="action-tile" onClick={() => navigate('/dashboard/habit')}>
          <FaList className="action-icon" /> View Habits
        </div>
      </section>

      <section className="dashboard-section recent-entries">
        <div className="section-header">
          <h3>Recent Journal Entries</h3>
          <a onClick={() => navigate('/dashboard/journal')} className="link" style={{ cursor: 'pointer' }}>
            View All
          </a>
        </div>
        {Array.isArray(entries) && entries.length > 0 ? (
          entries.slice(0, 3).map((entry) => (
            <div
              key={entry.id}
              className="entry"
              onClick={() => navigate(`/dashboard/journal/${entry.id}`)}
            >
              <div className="entry-header">
                <p className="entry-date">
                  <FaCalendarAlt /> {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="entry-snippet">
                {entry.content?.slice(0, 100)}...
              </p>
              <div className="entry-actions">
                <button
                  className="entry-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/journal/${entry.id}`);
                  }}
                  title="View full entry"
                >
                  <FaEye /> View
                </button>
                <button
                  className="entry-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/journal/edit/${entry.id}`);
                  }}
                  title="Edit this entry"
                >
                  <FaEdit /> Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="entry">
            <p className="entry-snippet">No journal entries yet. Start writing today!</p>
          </div>
        )}
      </section>

      {showWelcomeModal && <WelcomeModal onSave={handleSaveDisplayName} />}
      {showMoodLogsModal && <MoodLogsModal onClose={() => setShowMoodLogsModal(false)} />}
    </div>
  );
}

export default DashBoardHome;
