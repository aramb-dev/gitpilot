import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LoadingScreen from './LoadingScreen';
import { ToastContainer } from '../common/Toast';
import { useUiStore } from '../../store/uiStore';

/**
 * Main layout for authenticated pages
 * Includes header, sidebar, and content area
 */
const MainLayout = () => {
  const { user, loading } = useAuthStore();
  const { toasts, removeToast, sidebarOpen } = useUiStore();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading GitPilot..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-20'
      }`}>
        <Header />

        <main className="flex-1 pb-8">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MainLayout;
