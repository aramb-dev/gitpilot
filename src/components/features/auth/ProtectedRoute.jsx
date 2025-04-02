import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import LoadingScreen from "../../layout/LoadingScreen";

/**
 * Protected Route component
 * Guards routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  // Still checking authentication
  if (loading) {
    return <LoadingScreen message="Verifying access..." />;
  }

  // Not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated, render children
  return children;
};

export default ProtectedRoute;
