import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configurar axios base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticacion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  verifyToken: () => 
    api.get('/auth/verify'),
};

export const subscribersAPI = {
  getAll: (params = {}) => 
    api.get('/subscribers', { params }),
  
  create: (subscriberData) => 
    api.post('/subscribers', subscriberData),
  
  getExpiring: () => 
    api.get('/subscribers/expiring'),
};

export const uploadAPI = {
  uploadContract: (formData) => 
    api.post('/upload/contract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const adminsAPI = {
  getAll: () => 
    api.get('/admins'),
  
  create: (adminData) => 
    api.post('/admins', adminData),
};

export default api;
