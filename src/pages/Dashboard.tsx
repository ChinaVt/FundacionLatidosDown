import { useAuth } from '../context/AuthContext';
import { LogOut, User, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EstadisticasChart from '../components/EstadisticasChart';
import ResumenEstadisticas from '../components/ResumenEstadisticas'; // ✅ Importar
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  const handleStart = () => {
    navigate("/actividad");
  };

  return (
    <div className="dashboard-background min-h-screen">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <p className="p-saludo">
              Bienvenido, {user?.nombre} {user?.apellido}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-dashboard flex items-center space-x-2"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card de Perfil */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="card-icon">
                <User size={24} className="text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
            </div>
            <div className="space-y-3">
              <p className="perfil">Usuario</p>
              <p className="text-lg text-gray-800">{user?.nombreUsuario}</p>
              <p className="perfil">Nombre Completo</p>
              <p className="text-lg text-gray-800">{user?.nombre} {user?.apellido}</p>
              {user?.email && (
                <>
                  <p className="perfil">Email</p>
                  <p className="text-lg text-gray-800">{user.email}</p>
                </>
              )}
              <p className="perfil">Rol</p>
              <p className="text-lg text-gray-800">{user?.nombreRol}</p>
            </div>
          </div>

          {/* Card de Inicio Actividades */}
          <div className="card flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Comenzar Actividades</h3>
            <p className="actividad">Aquí puedes iniciar las ventanas de los juegos y actividades.</p>
            <button onClick={handleStart} className="btn-dashboard">
              <Play size={20} />
              <span>¡Empezar!</span>
            </button>
          </div>

          {/* Card de Estadísticas */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Estadísticas</h3>
            <p className="estadisticas" style={{ marginBottom: '15px' }}>
              Aquí verás estadísticas del avance del niño/a. en las actividades realizadas.
            </p>
            
            {user && <EstadisticasChart idUsuario={user.idUsuario} />}
          </div>
        </div>

        {/* ✅ RESUMEN GENERAL - Debajo de todo */}
        {user && <ResumenEstadisticas idUsuario={user.idUsuario} />}
      </main>
    </div>
  );
};

export default Dashboard;