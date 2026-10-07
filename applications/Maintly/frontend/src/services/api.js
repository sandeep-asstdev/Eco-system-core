import axios from 'axios';

let inMemoryToken = localStorage.getItem('maintly_token') || null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('maintly_token', token);
  } else {
    localStorage.removeItem('maintly_token');
  }
};

export const clearAuthToken = () => {
  inMemoryToken = null;
  localStorage.removeItem('maintly_token');
};

export const getAuthToken = () => inMemoryToken || localStorage.getItem('maintly_token');

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
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
    if (error.response?.status === 401) {
      clearAuthToken();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/callback') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
