import { useState, useEffect } from 'react';
import { getShareSettings, updateShareSettings } from '../../api/shareSettingsAPI';
import './ShareSettingsSection.css';

export default function ShareSettingsSection() {
  const [settings, setSettings] = useState({
    sharingEnabled: false,
    shareJournal: false,
    shareMood: false,
    shareHabit: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLoading(true);
    getShareSettings()
      .then(response => {
        setSettings(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load your sharing settings. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Handle main toggle change
  const handleMainToggleChange = () => {
    const newSharingEnabled = !settings.sharingEnabled;

    // If turning off main toggle, also turn off all sub-toggles
    const newSettings = {
      ...settings,
      sharingEnabled: newSharingEnabled,
    };

    if (!newSharingEnabled) {
      newSettings.shareJournal = false;
      newSettings.shareMood = false;
      newSettings.shareHabit = false;
    }

    setSettings(newSettings);
    setHasChanges(true);
    setSaveMessage('');
  };

  // Handle sub-toggle change
  const handleSubToggleChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
    setHasChanges(true);
    setSaveMessage('');
  };

  // Save settings
  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    setError(null);

    updateShareSettings(settings)
      .then(() => {
        setSaveMessage('Settings saved successfully!');
        setHasChanges(false);
        setSaving(false);
      })
      .catch(() => {
        setError('Failed to save your settings. Please try again.');
        setSaving(false);
      });
  };

  const Toggle = ({ active, disabled, onChange }) => (
    <div
      className={`share-toggle ${active ? 'active' : ''}`}
      onClick={disabled ? null : onChange}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div className="share-toggle-slider"></div>
    </div>
  );

  if (loading) {
    return <div className="share-settings-loading">Loading your sharing settings...</div>;
  }

  if (error && !settings) {
    return <div className="share-settings-error">{error}</div>;
  }

  return (
    <div className="share-settings-section">
      <h3>Feed Privacy Settings</h3>
      <p className="share-settings-description">
        Control exactly what you share with your connections on the wellness feed.
      </p>

      {/* Main Toggle */}
      <div className="share-settings-option">
        <div className="share-toggle-label">
          <span>🔘 Enable Feed Sharing</span>
          <Toggle
            active={settings.sharingEnabled}
            onChange={handleMainToggleChange}
          />
        </div>
        <p className="share-option-description">
          Master control. When off, all sharing is disabled and no one sees any of your updates.
        </p>
      </div>

      {/* Journal Toggle */}
      <div className="share-settings-option">
        <div className="share-toggle-label">
          <span>📓 Enable Journal Sharing</span>
          <Toggle
            active={settings.shareJournal}
            disabled={!settings.sharingEnabled}
            onChange={() => handleSubToggleChange('shareJournal')}
          />
        </div>
        <p className="share-option-description">
          When on, your journal entries can appear on the feed.
        </p>
      </div>

      {/* Mood Toggle */}
      <div className="share-settings-option">
        <div className="share-toggle-label">
          <span>🎭 Enable Mood Sharing</span>
          <Toggle
            active={settings.shareMood}
            disabled={!settings.sharingEnabled}
            onChange={() => handleSubToggleChange('shareMood')}
          />
        </div>
        <p className="share-option-description">
          When on, your mood updates are visible on the feed.
        </p>
      </div>

      {/* Habit Toggle */}
      <div className="share-settings-option">
        <div className="share-toggle-label">
          <span>🌱 Enable Habit Sharing</span>
          <Toggle
            active={settings.shareHabit}
            disabled={!settings.sharingEnabled}
            onChange={() => handleSubToggleChange('shareHabit')}
          />
        </div>
        <p className="share-option-description">
          When on, habits you've completed are visible on the feed.
        </p>
      </div>

      {/* Save Button and Messages */}
      <div className="share-settings-actions">
        <button
          className="share-settings-save-btn"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {saveMessage && (
          <span className="share-settings-saved-message">{saveMessage}</span>
        )}

        {error && (
          <span className="share-settings-error-message">{error}</span>
        )}
      </div>
    </div>
  );
}
