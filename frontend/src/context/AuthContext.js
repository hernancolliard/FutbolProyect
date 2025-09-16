import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedUser.exp > currentTime) {
          setUser(decodedUser);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = (navigate) => {
    localStorage.removeItem('token');
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    if (navigate) {
      navigate('/'); // Redirect to homepage
    }
  };

  const authContextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};