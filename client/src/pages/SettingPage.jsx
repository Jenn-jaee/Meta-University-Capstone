import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/api/user/me')
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  if (!user) return null;

  return <Outlet context={{ user, setUser }} />;
}
