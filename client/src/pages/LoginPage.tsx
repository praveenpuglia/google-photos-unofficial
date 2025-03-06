import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthUrl = async () => {
      try {
        setLoading(true);
        const url = await authApi.getAuthUrl();
        setAuthUrl(url);
      } catch (err) {
        setError('Failed to get authentication URL. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthUrl();
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Google Photos Viewer</h1>
        <p>View and browse your Google Photos library</p>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <a 
            href={authUrl} 
            className="login-button"
          >
            Login with Google
          </a>
        )}
        
        <div className="legal-links">
          <p>
            By logging in, you agree to our{' '}
            <Link to="/tnc" className="legal-link">Terms and Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" className="legal-link">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 