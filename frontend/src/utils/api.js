import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const subscribersAPI = {
  getAll: () => api.get('/subscribers'),
  getExpiring: () => api.get('/subscribers/expiring'),
  create: (data) => api.post('/subscribers', data),
  update: (id, data) => api.put(`/subscribers/${id}`, data),
  delete: (id) => api.delete(`/subscribers/${id}`),
  getById: (id) => api.get(`/subscribers/${id}`)
};

export const contractsAPI = {
  getAll: () => api.get('/contracts'),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
  download: (id) => api.get(`/contracts/download/${id}`),
  // AGREGAR ESTA FUNCIÓN QUE FALTABA
  upload: (formData) => api.post('/contracts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
};

export const uploadAPI = {
  uploadContract: (formData) => api.post('/upload/contract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

export const adminsAPI = {
  getAll: () => api.get('/admins'),
  create: (data) => api.post('/admins', data),
};

export default api;
