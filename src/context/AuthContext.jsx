import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set global base API URL to point to backend server
axios.defaults.baseURL = 'https://community-backend-pc5b.onrender.com/';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Apply default authorization header if token exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/api/auth/profile');
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          // Token expired or invalid
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error loading user profile:', err.response?.data?.message || err.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const userToken = res.data.token;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(res.data.data);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      if (res.data.success) {
        const userToken = res.data.token;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(res.data.data);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.'
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
