import api from './api';
import type { LoginRequest, RegisterRequest, LoginResponse } from '../types';

const authService = {
  // Login
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/Auth/login', data);
    return response.data;
  },

  // Register
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/Auth/register', data);
    return response.data;
  },

  // Guardar usuario en localStorage
  saveUser(user: LoginResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Obtener usuario de localStorage
  getUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Eliminar usuario de localStorage
  removeUser(): void {
    localStorage.removeItem('user');
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getUser();
  }
};

export default authService;