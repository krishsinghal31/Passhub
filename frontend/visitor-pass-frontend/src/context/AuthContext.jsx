// src/context/AuthContext.jsx - UPDATED
import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser({
            id: res.data.user._id || res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
            subscription: res.data.user.subscription || { isActive: false }
          });
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, role, name, email: userEmail, subscription, id, userId } = response.data;
        localStorage.setItem('token', token);
        
        const userData = { 
          id: id || userId,
          role, 
          name, 
          email: userEmail,
          subscription: subscription || { isActive: false }
        };
        
        setUser(userData);
        return { success: true, role };
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('token', token);
        
        const userData = {
          ...newUser,
          id: newUser._id || newUser.id
        };
        
        setUser(userData);
        return { success: true };
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data || { message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
