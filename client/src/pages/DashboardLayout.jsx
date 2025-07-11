// src/pages/DashboardLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import axios from '../api/axiosInstance';
import { setDarkMode } from '../utils/ThemeManager';
import '../components/Dashboard.css';

function DashboardLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    axios.get('/api/user/me')
      .then(res => {
        setDarkMode(res.data.darkMode);   // apply this user’s choice
        setReady(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setDarkMode(false);               // ensure public pages are light
        navigate('/signin');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setDarkMode(false);                   // back to light for sign-in
    navigate('/');
  };

  if (!ready) return null;                // or spinner
  return (
    <div className="dashboard">
      <Header onLogout={handleLogout} />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
