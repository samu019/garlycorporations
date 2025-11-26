import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// DEBUG: Mostrar la URL de la API
console.log('🔧 DEBUG - API_BASE_URL:', API_BASE_URL);
console.log('🔧 DEBUG - Environment:', import.meta.env);

const api = axios.create({
  baseURL: API_BASE_URL,
  // TEMPORALMENTE deshabilitar withCredentials para pruebas
  // withCredentials: true,
  timeout: 15000,
});

// Interceptor de requests para debug
api.interceptors.request.use((config) => {
  console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
  console.log('📤 Headers:', config.headers);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de responses para debug
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función de prueba de conexión
export const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión con el backend...');
    const response = await api.get('/health');
    console.log('✅ Conexión exitosa:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    throw error;
  }
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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

export const adminsAPI = {
  getAll: () => api.get('/admins'),
  create: (data) => api.post('/admins', data),
};

export default api;
