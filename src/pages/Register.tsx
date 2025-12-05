import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Lock, Mail, Phone, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import LogoFundacion from '../assets/logo.png';


const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nombreUsuario: '',
    contrasena: '',
    confirmarContrasena: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.nombreUsuario || !formData.contrasena || !formData.nombre || !formData.apellido) {
      setError('Por favor completa todos los campos obligatorios');
      return false;
    }
    if (formData.nombreUsuario.length < 4) {
      setError('El nombre de usuario debe tener al menos 4 caracteres');
      return false;
    }
    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      setError('El email no es válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        nombreUsuario: formData.nombreUsuario,
        contrasena: formData.contrasena,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email || undefined,
        telefono: formData.telefono || undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-login-background min-h-screen flex items-center justify-center p-4">
      <div className="card-login max-w-2xl">
        {/* Logo */}
        <div className="logo-container mx-auto mb-6">
          <img src={LogoFundacion} alt="Logo Fundación" className="logo-fundacion" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-orange-800 mb-1">¡Crea tu cuenta!</h1>
          <p className="text-base md:text-lg text-orange-700">Completa el formulario para registrarte</p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message flex items-center space-x-2 mb-4">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {/* Campos obligatorios */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex items-center space-x-2 mb-4">
          <CheckCircle className="text-blue-500" size={20} />
          <p className="text-blue-700 font-medium">Los campos con * son obligatorios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Nombre *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="input-login pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                className="input-login"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Usuario *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleChange}
                placeholder="juan_perez"
                className="input-login pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="input-login pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Confirmar Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="input-login pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@email.com"
                  className="input-login pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="0987654321"
                  className="input-login pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login w-full flex items-center justify-center gap-2 text-lg py-3"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <UserPlus size={24} />}
            <span>{loading ? 'Registrando...' : 'Crear Cuenta'}</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-orange-700">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-600 font-bold hover:text-orange-700">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
