import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthSuccess from './pages/AuthSuccess';
import SignIn from './components/signIn';

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



function Dashboard() {
  return <h1>Welcome to Dashboard!</h1>;
}

export default App;
