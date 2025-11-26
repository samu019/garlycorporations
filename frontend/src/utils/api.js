import axios from 'axios';

const API_BASE_URL = 'https://garlycorporations.onrender.com/api';
console.log('🎯 Backend URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  // TEMPORAL: Deshabilitar withCredentials para evitar CORS preflight
  // withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  console.log('🚀 Request to:', config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Exportar todas las APIs...
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

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

export const adminsAPI = {
  getAll: () => api.get('/admins'),
  create: (data) => api.post('/admins', data),
};

export default api;
