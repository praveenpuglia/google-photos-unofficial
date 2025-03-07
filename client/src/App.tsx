import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import PhotosPage from './pages/PhotosPage'
import ExplorePage from './pages/ExplorePage'
import AuthSuccessPage from './pages/AuthSuccessPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import { authApi } from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const status = await authApi.checkAuthStatus();
        setIsAuthenticated(status);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/photos" /> : <LoginPage />
        } />
        <Route path="/auth-success" element={<AuthSuccessPage />} />
        <Route path="/photos" element={
          isAuthenticated ? <PhotosPage /> : <Navigate to="/" />
        } />
        <Route path="/explore" element={
          isAuthenticated ? <ExplorePage /> : <Navigate to="/" />
        } />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/tnc" element={<TermsAndConditionsPage />} />
      </Routes>
    </Router>
  );
}

export default App
