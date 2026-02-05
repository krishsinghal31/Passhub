// src/utils/api.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
//   timeout: 10000,
// });

// api.interceptors.request.use(config => {
//   // Priority: securityToken > regularToken
//   const securityToken = localStorage.getItem('securityToken');
//   const regularToken = localStorage.getItem('token');
  
//   const token = securityToken || regularToken;
  
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
  
//   return config;
// });

// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response?.status === 401) {
//       // Clear all auth data on 401
//       localStorage.removeItem('token');
//       localStorage.removeItem('securityToken');
//       localStorage.removeItem('securityId');
//       localStorage.removeItem('securityEmail');
      
//       // Redirect to home
//       window.location.href = '/';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/utils/api.js - UPDATED
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
    const regularToken = localStorage.getItem('token');
    const securityToken = localStorage.getItem('securityToken');

    // Logic: If calling security endpoints, prioritize the security token
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
            // Only clear the token that actually failed
            if (window.location.pathname.includes('/security')) {
                localStorage.removeItem('securityToken');
            } else {
                localStorage.removeItem('token');
            }
            // Don't redirect automatically - let components handle it
            // This prevents 404 errors on refresh
        }
        return Promise.reject(error);
    }
);

export default api;