/**
 * GitPilot Routing Configuration
 * Defines all application routes and their access requirements
 */

import { Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SettingsPage from '../pages/SettingsPage';
import BillingPage from '../pages/BillingPage';
import NotFoundPage from '../pages/NotFoundPage';

// Auth Components
import AuthCallback from '../components/features/auth/AuthCallback';
import { ProtectedRoute } from '../components/features/auth/ProtectedRoute';

/**
 * Route definitions for the GitPilot application
 * Public routes do not require authentication
 * Protected routes require user to be logged in
 */
const routes = [
  {
    // Public routes with AuthLayout (landing page, login)
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
    ],
  },
  {
    // Protected routes with MainLayout (dashboard, settings, etc.)
    element: <MainLayout />,
    children: [
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/billing',
        element: (
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        ),
      },
      // Redirect /app to dashboard as a convenience shortcut
      {
        path: '/app',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    // 404 Not Found route
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
