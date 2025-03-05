import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthSuccessPage.css';

const AuthSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to photos page after a short delay
    const timer = setTimeout(() => {
      navigate('/photos');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="auth-success-container">
      <div className="auth-success-card">
        <h1>Authentication Successful!</h1>
        <p>You have successfully logged in with Google.</p>
        <p>Redirecting to your photos...</p>
      </div>
    </div>
  );
};

export default AuthSuccessPage; 