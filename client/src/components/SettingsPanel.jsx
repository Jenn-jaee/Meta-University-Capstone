import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import ProfileInfoSection from './settings/ProfileInfoSection';
import PreferencesSection from './settings/PreferencesSection';
import ShareSettingsSection from './settings/ShareSettingsSection';

import './SettingsPanel.css';

function SettingsPanel() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get('/api/user/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        // Handle error silently - user will be null
      });
  }, []);

  if (!user) return null; // Loading state

  return (
    <div className="settings-panel">
      {/* Close (X) button */}
      <button
        className="settings-close-btn"
        aria-label="Close settings"
        onClick={() => navigate('/dashboard')}
      >
        ×
      </button>

      <h2>Account Information</h2>

      <ProfileInfoSection
        user={user}
        onAvatarUpdate={(url) => setUser({ ...user, avatarUrl: url })}
      />

      <PreferencesSection
        user={user}
        onPrefsUpdate={(newPrefs) => setUser({ ...user, ...newPrefs })}
      />

      <ShareSettingsSection />
    </div>
  );
}

export default SettingsPanel;
