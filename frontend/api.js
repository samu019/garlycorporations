import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://garlycorporations.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true, // Temporalmente deshabilitado
  timeout: 15000,
});

// ... el resto del código se mantiene igual
