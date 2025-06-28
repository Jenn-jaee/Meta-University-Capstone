import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthSuccess from './pages/AuthSuccess';
import SignIn from './components/signIn';
import Dashboard from './components/Dashboard';  // Updated path


function App() {
  console.log("App component loaded!");
    return (
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    );
  }



export default App;
