import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const initAuth = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (savedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setToken(savedToken);
        } catch (err) {
          console.error('Session verification failed:', err);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const profile = await authService.login(email, password);
      setUser(profile);
      setToken(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const registered = await authService.register(userData);
      return registered;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
