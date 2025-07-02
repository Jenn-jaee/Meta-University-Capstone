import { useNavigate, Outlet } from 'react-router-dom';
import Header from '../components/Header';
import '../components/Dashboard.css';

function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard">
      {/* Top Header with all navigation links */}
      <Header onLogout={handleLogout} />

      {/* Dynamic page content will be injected here */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
