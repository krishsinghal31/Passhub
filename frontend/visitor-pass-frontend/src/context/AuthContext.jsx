// src/context/AuthContext.jsx 
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizeUser = (data) => {
    const d = data.user || data; 
    const userData = {
        id: d._id || d.id || "SUPER_ADMIN",
        name: d.name || "Super Admin",
        email: d.email || process.env.SUPER_ADMIN_EMAIL || "admin@passhub.com",
        role: d.role || "SUPER_ADMIN",
        subscription: d.subscription || { isActive: false }
    };
    
    // Only try to get profile picture if user has a valid ID (not SUPER_ADMIN string)
    if (userData.id && userData.id !== "SUPER_ADMIN") {
      const savedPic = localStorage.getItem(`profile_picture_${userData.id}`);
      if (savedPic) userData.profilePicture = savedPic;
    }
    
    return userData;
   };
//     const normalizeUser = (data) => {
//         const userId = data.user?._id || data.user?.id || data.userId;
//     const userData = {
//         id: data.user?.id || data.user?._id || data.userId,
//         name: data.user?.name,
//         email: data.user?.email,
//         role: data.role || data.user?.role,
//         subscription: data.user?.subscription || {}
//     };

//     const savedPic = localStorage.getItem(`profile_picture_${userData.id}`);
//     if (savedPic) {
//         userData.profilePicture = savedPic;
//     }
    
//     return userData;
// };

    const verifyAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            if (res.data.success && res.data.user) {
                setUser(normalizeUser(res.data));
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            // Only clear token if it's a 401/403 error, not network errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

   const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { 
            email: email.trim().toLowerCase(), 
            password 
        });

        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            
            const userData = normalizeUser(response.data);
            setUser(userData);
            
            return { success: true, role: userData.role };
        }
    } catch (error) {
        console.error("Login Error Details:", error.response?.data);
        throw error.response?.data || { message: 'Login failed' };
    }
};

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('securityToken');
        setUser(null);
    };

    const refreshUser = async () => {
        await verifyAuth();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

