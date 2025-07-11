import { useState } from 'react';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { setDarkMode } from '../../utils/ThemeManager';
import './PreferencesSection.css';

export default function PreferencesSection({ user }) {
  const [prefs, setPrefs] = useState({
    darkMode:        user.darkMode,
    dailyReminders:  user.dailyReminders,
    privateJournal:  user.privateJournal,
  });

  const handleToggle = key => {
  const next = { ...prefs, [key]: !prefs[key] };
  setPrefs(next);

  if (key === 'darkMode') {  // instant UI
    setDarkMode(next.darkMode);

    // Immediately persist this single field
    axios.patch('/api/user/profile', { darkMode: next.darkMode })
         .catch(() => toast.error('Could not save theme'));
  }
};


  const handleSave = () => {
    axios.patch('/api/user/profile', prefs)
      .then(() => toast.success('Preferences saved!'))
      .catch(()  => toast.error('Save failed'));
  };

  return (
    <section className="prefs-section">
      <h3>Preferences</h3>

      <div className="pref-row">
        <span>Dark Mode</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.darkMode}
            onChange={() => handleToggle('darkMode')}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="pref-row">
        <span>Daily Reminders</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.dailyReminders}
            onChange={() => handleToggle('dailyReminders')}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="pref-row">
        <span>Private Journal</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={prefs.privateJournal}
            onChange={() => handleToggle('privateJournal')}
          />
          <span className="slider" />
        </label>
      </div>

      <button type="button" className="save-btn" onClick={handleSave}>
        Save Preferences
      </button>
    </section>
  );
}
