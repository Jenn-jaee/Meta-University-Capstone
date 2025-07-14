import { useState, useRef } from 'react';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import './ProfileInfoSection.css';

export default function ProfileInfoSection({ user, onAvatarUpdate }) {
  const fileInputRef = useRef(null);

  // Avatar preview state
  const [preview, setPreview] = useState(user.avatarUrl || '');

  // Editable form state
  const [form, setForm] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    phone: user.phone || '',
  });

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar image selection + upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update preview instantly
    setPreview(URL.createObjectURL(file));

    // Prepare image file for upload to server
    const formData = new FormData();
    formData.append('avatar', file);

    axios
      .post('/api/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        toast.success('Profile photo updated!');
        if (onAvatarUpdate) {
          onAvatarUpdate(res.data.avatarUrl);
        }
      })
      .catch(() => {
        toast.error('Photo upload failed. Please try again.');
        setPreview(user.avatarUrl || '');
      });
  };

  // Handle Save Changes click
  const handleSaveProfile = () => {
    // Prevent save if no actual change made
    if (
      form.displayName === user.displayName &&
      form.email === user.email &&
      form.phone === user.phone
    ) {
      toast('No changes to save');
      return;
    }

    axios
      .patch('/api/user/profile', form)
      .then((res) => {
        toast.success('Profile updated!');
        if (onAvatarUpdate) {
          onAvatarUpdate(res.data.avatarUrl ?? preview);
        }
      })
      .catch(() => {
        toast.error('Could not save profile');
      });
  };
  // Check if user is OAuth user (no email)
  const isOAuth = Boolean(user.googleId);

  return (
    <div className="profile-info">
      {/* Profile photo preview and upload trigger */}
      <img
        src={preview || '/default-avatar.png'}
        alt="Profile"
        className="profile-avatar"
        onClick={() => fileInputRef.current.click()}
      />
      <button
        type="button"
        className="change-photo-btn"
        onClick={() => fileInputRef.current.click()}
      >
        Change Photo
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Editable profile form */}
      <div className="profile-fields">
        <label>
          Display Name
          <input
            type="text"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={isOAuth} // Disable email editing for OAuth users
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <button type="button" className="save-btn" onClick={handleSaveProfile}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
