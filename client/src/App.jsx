import { Toaster } from 'react-hot-toast';
import SignIn from './components/signIn';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashBoardHome';
import JournalPage from './pages/JournalPage';
import HabitPage from './pages/HabitPage';
import MoodPage from './pages/MoodPage';
import AuthSuccess from './pages/AuthSuccess';
import WelcomePage from './pages/WelcomePage';
import SettingsPanel from './components/SettingsPanel.jsx';
import FeedPage from './pages/FeedPage';
import ConnectPage from './pages/ConnectPage';


function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="journal/:id" element={<JournalPage />} />
          <Route path="journal/edit/:id" element={<JournalPage />} />
          <Route path="habit" element={<HabitPage />} />
          <Route path="mood" element={<MoodPage />} />
          <Route path="settings" element={<SettingsPanel />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="connect" element={<ConnectPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
