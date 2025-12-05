import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';
import type { AuthContextType, LoginResponse, RegisterRequest } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = authService.getUser();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (nombreUsuario: string, contrasena: string) => {
    try {
      const userData = await authService.login({ nombreUsuario, contrasena });
      authService.saveUser(userData);
      setUser(userData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Error al iniciar sesión');
    }
  };

  // Register
  const register = async (data: RegisterRequest) => {
    try {
      const userData = await authService.register(data);
      authService.saveUser(userData);
      setUser(userData);
     } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Error al iniciar sesión');
    }
  };
  // Logout
  const logout = () => {
    authService.removeUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Exportar al final
// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };