import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';
import {
  signInWithGitHub,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { useAuthStore } from '../store/authStore';

/**
 * Hook for managing authentication state and GitHub OAuth
 */
export const useAuth = () => {
  const {
    user,
    loading,
    error,
    githubToken,
    setUser,
    setLoading,
    setError,
    setGitHubToken
  } = useAuthStore();
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Format user data for our store
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [setUser, setLoading]);

  // GitHub sign in handler
  const signInWithGitHubHandler = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithGitHub();

      // Store GitHub token
      if (result?.githubToken) {
        setGitHubToken(result.githubToken);
      }

      navigate('/dashboard');
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setLoading, setError, setGitHubToken]);

  // Sign out handler
  const signOutHandler = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setGitHubToken(null);
      navigate('/');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setLoading, setError, setUser, setGitHubToken]);

  return {
    user,
    loading,
    error,
    githubToken,
    signInWithGitHub: signInWithGitHubHandler,
    signOut: signOutHandler,
    isAuthenticated: !!user,
  };
};
