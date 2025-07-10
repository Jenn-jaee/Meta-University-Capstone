import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import './SettingsPanel.css';

const SettingsPanel = ({ show, onClose }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (show) {
      fetchProfile();
    }
  }, [show]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch('/api/user/profile', {
        displayName: profile.displayName,
        dailyReminders: profile.dailyReminders,
        privateJournal: profile.privateJournal,
        themePreference: profile.themePreference,
      });
      alert('Changes saved successfully!');
      onClose(); // optional: close panel after save
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to save changes.');
    }
  };

  if (!show) return null;

  return (
    <div className='dashboard-blur'>
        <div className="settings-panel">
        <div className="settings-header">
            <h2>Settings</h2>
            <button onClick={onClose}>X</button>
        </div>

        {!profile ? (
            <p>Loading...</p>
        ) : (
            <form className="settings-form">
                <div className="form-group">
                    <label htmlFor="avatarUrl">Profile Image URL</label>
                    <input
                        type="text"
                        id="avatarUrl"
                        value={profile.avatarUrl || ''}
                        onChange={(e) =>
                        setProfile({ ...profile, avatarUrl: e.target.value })
                        }
                    />
                    {profile.avatarUrl && (
                        <img
                        src={profile.avatarUrl}
                        alt="Profile Preview"
                        className="avatar-preview"
                        />
                    )}
                </div>

            <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                type="text"
                id="displayName"
                value={profile.displayName || ''}
                onChange={(e) =>
                    setProfile({ ...profile, displayName: e.target.value })
                }
                />
            </div>

            <div className="form-group">
                <label>
                <input
                    type="checkbox"
                    checked={profile.dailyReminders || false}
                    onChange={(e) =>
                    setProfile({ ...profile, dailyReminders: e.target.checked })
                    }
                />
                Enable Daily Reminders
                </label>
            </div>

            <div className="form-group">
                <label>
                <input
                    type="checkbox"
                    checked={profile.privateJournal || false}
                    onChange={(e) =>
                    setProfile({ ...profile, privateJournal: e.target.checked })
                    }
                />
                Keep Journal Private
                </label>
            </div>

            <div className="form-group">
                <label htmlFor="themePreference">Theme</label>
                <select
                id="themePreference"
                value={profile.themePreference || 'light'}
                onChange={(e) =>
                    setProfile({ ...profile, themePreference: e.target.value })
                }
                >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                </select>
            </div>

            <button
                type="button"
                onClick={handleSave}
                className="save-button"
            >
                Save Changes
            </button>
            </form>
        )}
        </div>
    </div>
  );
};

export default SettingsPanel;
