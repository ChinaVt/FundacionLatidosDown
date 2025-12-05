import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';


// Importa tu logo
import LogoFundacion from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ nombreUsuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.nombreUsuario || !formData.contrasena) {
      setError('❌ Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      await login(formData.nombreUsuario, formData.contrasena);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? `❌ ${err.message}` : '❌ Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-login-background min-h-screen flex items-center justify-center p-4">
      <div className="card-login">

        {/* Logo grande arriba */}
        <div className="logo-container mx-auto mb-6">
          <img src={LogoFundacion} alt="Logo Fundación" className="logo-fundacion" />
        </div>

        {/* Header / saludo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-800 mb-1 text-center">¡Hola Amig@!</h1>
          <p className="text-lg text-orange-700">Inicia sesión para comenzar tu aventura</p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message flex items-center space-x-2">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-orange-800 font-bold mb-1">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" size={24} />
              <input
                type="text"
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleChange}
                placeholder="Tu nombre mágico"
                className="input-login pl-12"
                disabled={loading}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-orange-800 font-bold mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" size={24} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Tu contraseña secreta"
                className="input-login pl-12"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600 transition-colors"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Iniciando...</span>
              </>
            ) : (
              <>
                <LogIn size={24} />
                <span>¡Entrar! 🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Registro */}
        <div className="mt-5 text-center">
          <p className="text-orange-700">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700">
              ¡Regístrate aquí! ✨
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
