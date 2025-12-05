import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fundacionlatidosdown.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Permitir certificados autofirmados en desarrollo
  httpsAgent: {
    rejectUnauthorized: false,
  } as unknown,
});

// Interceptor para agregar token si existe
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      // Aquí agregarías el token JWT cuando lo implementes
      // config.headers.Authorization = `Bearer ${userData.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;