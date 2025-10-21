import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthCallback } from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  forceLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Helper function to check if JWT token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  };

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedToken && savedUser) {
      try {
        // Check if token is expired
        if (isTokenExpired(savedToken)) {
          console.log('Stored token is expired, clearing auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          return;
        }

        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // Force logout function that can be called from API errors
  const forceLogout = () => {
    console.log('Force logout due to authentication error');
    logout();
  };

  // Register the forceLogout callback with the API utility
  useEffect(() => {
    setAuthCallback(forceLogout);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, forceLogout }}>
      {children}
    </AuthContext.Provider>
  );
};