import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * This component protects routes that require authentication.
 * If user is not authenticated, redirects to login page with return URL.
 * 
 * Props:
 * - children: The component to render if authenticated
 * - redirectTo: The path to redirect to if not authenticated (default: '/user-login')
 * - message: Custom message to show on login page
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/user-login', 
  message = 'Please sign in to access this page' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with state
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname + location.search,
          message: message
        }} 
        replace 
      />
    );
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;