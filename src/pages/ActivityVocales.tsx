import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Importar
import type { Actividad } from "../types";
import { useState, useEffect } from "react";
import "../styles/ActivityVocales.css";

interface ActivityVocalesProps {
  actividad: Actividad;   
}

const ActivityVocales: React.FC<ActivityVocalesProps> = ({ actividad }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Obtener usuario

  const [vocalGif, setVocalGif] = useState<string | null>(null);

  // ✅ Estados para tracking de progreso
  const [vocalesClicadas, setVocalesClicadas] = useState<Set<string>>(new Set());
  const [tiempoInicio] = useState(Date.now());
  const [progresoGuardado, setProgresoGuardado] = useState(false);

  const vocales = ["A", "E", "I", "O", "U"];

  // ✅ Función para guardar progreso
  const guardarProgreso = async (completada: boolean) => {
    if (!user || progresoGuardado) return;

    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000);
    const puntaje = Math.floor((vocalesClicadas.size / vocales.length) * 100);

    try {
      await fetch('https://fundacionlatidosdown.azurewebsites.net/api/Progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: user.idUsuario,
          idActividad: actividad.idActividad,
          fechaInicio: new Date().toISOString(),
          fechaCompletada: completada ? new Date().toISOString() : null,
          puntajeObtenido: completada ? 100 : puntaje,
          tiempoEmpleado: tiempoEmpleado,
          completada: completada,
          intentos: vocalesClicadas.size
        })
      });

      setProgresoGuardado(true);
      console.log('✅ Progreso guardado correctamente');
    } catch (error) {
      console.error('❌ Error al guardar progreso:', error);
    }
  };

  // ✅ Verificar si completó todas las vocales
  useEffect(() => {
    if (vocalesClicadas.size === vocales.length && !progresoGuardado) {
      guardarProgreso(true);
    }
  }, [vocalesClicadas]);

  // ✅ Guardar progreso cuando salga de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!progresoGuardado && vocalesClicadas.size > 0) {
        guardarProgreso(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [vocalesClicadas, progresoGuardado]);

  const reproducirVocal = (vocal: string) => {
    // ✅ Registrar vocal clicada
    setVocalesClicadas(prev => new Set(prev).add(vocal));

    // Reiniciar el GIF siempre
    setVocalGif(null);
    setTimeout(() => {
      setVocalGif(`/public/assets/gif/${vocal}.gif?t=${Date.now()}`);
    }, 50);

    const audio = new Audio(`/public/assets/audio/${vocal}.mp3`);
    audio.play().catch(err => console.error(err));

    // Tiempo fijo
    setTimeout(() => setVocalGif(null), 5000);
  };

  return (
    <div className="dashboard-background min-h-screen p-6">
      <button 
        className="btn-dashboard mb-6 flex items-center gap-2"
        onClick={() => {
          // ✅ Guardar progreso antes de salir
          if (!progresoGuardado && vocalesClicadas.size > 0) {
            guardarProgreso(false);
          }
          navigate("/actividad");
        }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <h2 className="nombre1">{actividad.nombre}</h2>

      {/* ✅ Indicador de progreso */}
      {vocalesClicadas.size > 0 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          Progreso: {vocalesClicadas.size} de {vocales.length} vocales practicadas
          {vocalesClicadas.size === vocales.length && " 🎉 ¡Completado!"}
        </div>
      )}

      <div className="card text-center mt-6">
        <p className="descripcion-vocales">{actividad.descripcion}</p>
        <p className="pronunciation mb-4">
          Haz clic en cada vocal para escuchar su pronunciación:
        </p>

        <div className="vocales flex flex-wrap justify-center gap-4 mt-4">
          {vocales.map(vocal => (
            <button
              key={vocal}
              className={`btn-dashboard px-6 py-3 text-white rounded flex items-center justify-center gap-2 ${
                vocalesClicadas.has(vocal) ? 'bg-green-500' : 'bg-orange-500'
              }`}
              onClick={() => reproducirVocal(vocal)}
              style={{
                backgroundColor: vocalesClicadas.has(vocal) ? '#4caf50' : '#ff7a00',
                transition: 'background-color 0.3s'
              }}
            >
              <Play size={20} /> {vocal}
              {vocalesClicadas.has(vocal) && " ✓"}
            </button>
          ))}
        </div>

        {vocalGif && (
          <div className="GIF-container mt-6 flex justify-center">
            <img src={vocalGif} alt="Vocal animada" className="w-48 h-48" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityVocales;