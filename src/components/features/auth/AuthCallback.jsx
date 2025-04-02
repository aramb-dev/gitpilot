import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { Spinner } from '../../common/Spinner';
import { AlertTriangle } from 'lucide-react';

/**
 * GitHub OAuth callback handler
 * Processes the callback from GitHub after authorization
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setGitHubToken, setGitHubUser } = useAuthStore();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const githubUsername = params.get('githubUsername');

        if (!token) {
          throw new Error('Authentication failed. No token received from the server.');
        }

        // Sign in with the custom token from Firebase Function
        const auth = getAuth();
        await signInWithCustomToken(auth, token);

        // Store GitHub username
        if (githubUsername) {
          setGitHubUser({ login: githubUsername });
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate, setGitHubToken, setGitHubUser]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Back to Login
            </button>
          </div>
