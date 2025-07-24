import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../components/SignIn.css';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Short delay to show loading state
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setIsLoading(false);
      setError(true);
    }
  }, [navigate, searchParams]);

  return (
    <div className="signin-container">
      {isLoading && (
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

            <h3 className="loading-title">Authentication Successful</h3>
            <p className="loading-message">Preparing your wellness journey...</p>

            <div className="loading-progress">
              <div className="loading-progress-bar">
                <div className="loading-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="signin-box">
          <h1 className="signin-title" style={{ color: '#e74c3c' }}>Authentication Failed</h1>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            We couldn't authenticate your account. Please try again.
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="submit-btn"
          >
            Return to Sign In
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthSuccess;
