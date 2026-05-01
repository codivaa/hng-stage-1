import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Wait for the initial /api/users/me check before deciding where to send the user.
  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  // If there is no session, send the user to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Prevent flicker while the app checks whether the user is already logged in.
  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  // Logged-in users should not stay on the login page.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  // Admin pages wait for auth state before checking the user's role.
  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  // Non-admin users are redirected back to the normal dashboard.
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
