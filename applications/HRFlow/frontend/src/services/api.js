import axios from 'axios';

let inMemoryToken = localStorage.getItem('hrflow_token') || null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('hrflow_token', token);
  } else {
    localStorage.removeItem('hrflow_token');
  }
};

export const getAuthToken = () => {
  return inMemoryToken || localStorage.getItem('hrflow_token');
};

export const clearAuthToken = () => {
  inMemoryToken = null;
  localStorage.removeItem('hrflow_token');
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error && typeof error.response.data.error === 'object') {
      const errObj = error.response.data.error;
      error.response.data.rawError = errObj;
      error.response.data.error = errObj.message || errObj.code || JSON.stringify(errObj);
    }
    if (error.response && error.response.status === 401) {
      clearAuthToken();
      // If unauthorized and not already on login, callback or join page, redirect to login
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/join') && !pathname.startsWith('/callback')) {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
