import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance.js';
import { BASE_URL } from '../api/axiosInstance.js';
import { setDarkMode } from '../utils/ThemeManager.js';
import './SignIn.css';

function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDarkMode(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = isLogin
        ? { email, password }
        : { email, password, name };

      const response = await axios.post(endpoint, data);

      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
  };

  return (
    <div className="signin-container">
      {(isLoading || isGoogleLoading) && (
        <div className="fancy-loading-overlay">
          <div className="fancy-loading-content">
            <div className="bloom-loader">
              <div className="bloom-petals">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="bloom-center"></div>
            </div>

            <h3 className="loading-title">Welcome to Bloom</h3>
            <p className="loading-message">Preparing your wellness journey...</p>

            <div className="loading-progress">
              <div className="loading-progress-bar">
                <div className="loading-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="signin-box">
        <h1 className="signin-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signin-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />

          <button type="submit" className="submit-btn">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">OR</div>

        <a
          href={`${BASE_URL}/api/auth/google`}
          className="google-link"
          onClick={handleGoogleLogin}
        >
            <button className="google-btn">
                <span className="google-icon">🔍</span>
                Continue with Google
            </button>
        </a>

        <p className="toggle-section">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="toggle-btn"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
