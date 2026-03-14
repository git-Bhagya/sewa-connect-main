import axios from 'axios';

// Provide your exact Railway App domain here or via Vercel Environment Variables (Recommended)
const PROD_BACKEND_URL = 'https://your-railway-app.up.railway.app/api'; 
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_BACKEND_URL : 'http://localhost:5000/api');

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || (error.response?.status === 404 && error.config.url?.includes('/Profile'))) {
      // Clear token if unauthorized or if user profile is not found (stale token)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
