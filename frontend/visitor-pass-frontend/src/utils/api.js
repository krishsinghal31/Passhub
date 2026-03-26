// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
    const regularToken = localStorage.getItem('token');
    const securityToken = localStorage.getItem('securityToken');

    const isSecurityEndpoint = config.url.includes('/security');
    const token = isSecurityEndpoint ? (securityToken || regularToken) : regularToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (window.location.pathname.includes('/security')) {
                localStorage.removeItem('securityToken');
            } else {
                localStorage.removeItem('token');
            }
        }
        return Promise.reject(error);
    }
);

export default api;