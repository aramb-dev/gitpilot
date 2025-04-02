import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import { ToastContainer } from '../common/Toast';
import { useUiStore } from '../../store/uiStore';

/**
 * Layout for unauthenticated pages (landing, login)
 */
const AuthLayout = () => {
  const { user, loading } = useAuthStore();
  const { toasts, removeToast } = useUiStore();
  const location = useLocation();

  // Don't redirect from landing page or auth callback
  const isLandingPage = location.pathname === '/';
  const isAuthCallback = location.pathname === '/auth/callback';

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  // If user is authenticated and not on landing page, redirect to dashboard
  if (user && !isLandingPage && !isAuthCallback) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer minimal={!isLandingPage} />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AuthLayout;
