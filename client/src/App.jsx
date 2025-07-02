import SignIn from './components/signIn';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashBoardHome';
import JournalPage from './pages/JournalPage';
import HabitPage from './pages/HabitPage';
import MoodPage from './pages/MoodPage';
import AuthSuccess from './pages/AuthSuccess';
import WelcomePage from './pages/WelcomePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth-success" element={<AuthSuccess />} /> {/* ✅ Add this */}

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="habit" element={<HabitPage />} />
          <Route path="mood" element={<MoodPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
