import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from '../api/axiosInstance.js';
import { BASE_URL } from '../api/axiosInstance.js';
import { setDarkMode } from '../utils/ThemeManager.js';
import './SignIn.css';

function SignIn() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');

  const [isLogin, setIsLogin] = useState(mode !== 'signup');
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

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="signin-container">
      <button onClick={goBack} className="back-button">
        <FaArrowLeft /> Back to Home
      </button>
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
                <span className="google-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                </span>
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
