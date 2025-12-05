// ==================== AUTH TYPES ====================

export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombreUsuario: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
}

export interface LoginResponse {
  idUsuario: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  email?: string;
  idRol: number;
  nombreRol: string;
}

// ==================== USER TYPES ====================

export interface User {
  idUsuario: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  idRol: number;
  fechaCreacion: string;
  activo: boolean;
  rol?: Rol;
}

export interface Rol {
  idRol: number;
  nombreRol: string;
  descripcion?: string;
}

// ==================== ACTIVIDAD TYPES ====================

export interface Actividad {
  idActividad: number;
  nombre: string;
  descripcion?: string;
  tipo: string;
  nivel: string;
  contenidoURL?: string;
  recursosMultimedia?: string;
  duracionEstimada?: number;
  puntajeMaximo: number;
  activo: boolean;
  fechaCreacion: string
}

// ==================== PROGRESO TYPES ====================

export interface Progreso {
  idProgreso: number;
  idUsuario: number;
  idActividad: number;
  fechaInicio: string;
  fechaCompletada?: string;
  puntajeObtenido?: number;
  tiempoEmpleado?: number;
  completada: boolean;
  intentos: number;
  actividad?: Actividad;
}

// ==================== SESION TYPES ====================

export interface Sesion {
  idSesion: number;
  idUsuario: number;
  fechaInicio: string;
  fechaFin?: string;
  tiempoTotal?: number;
  tipoDispositivo?: string;
}

// ==================== CONTEXT TYPES ====================

export interface AuthContextType {
  user: LoginResponse | null;
  login: (nombreUsuario: string, contrasena: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}