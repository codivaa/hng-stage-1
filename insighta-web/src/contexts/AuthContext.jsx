import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Central auth state shared by pages/components through React context.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount by asking the backend for the current user.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Backend invalidates the session, then frontend clears local user state.
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError('Failed to logout');
      throw err;
    }
  };

  const handleLoginSuccess = (userData) => {
    // Used when a login flow returns user data and the app needs to update context.
    setUser(userData);
  };

  // This is the value every component receives when it calls useContext(AuthContext).
  const value = {
    user,
    loading,
    error,
    logout: handleLogout,
    loginSuccess: handleLoginSuccess,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
