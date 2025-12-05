import { useEffect, useState } from 'react';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';

interface ResumenData {
  actividadesCompletadas: number;
  totalPuntaje: number;
  promedioPuntaje: number;
  tiempoTotalSegundos: number;
  tiempoTotalMinutos: number;
}

interface Props {
  idUsuario: number;
}

const ResumenEstadisticas = ({ idUsuario }: Props) => {
  const [resumen, setResumen] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const response = await fetch(`https://fundacionlatidosdown.azurewebsites.net/api/Progreso/resumen/${idUsuario}`);
        if (!response.ok) throw new Error('Error al cargar resumen');
        const data = await response.json();
        console.log('📈 Resumen cargado:', data);
        setResumen(data);
      } catch (error) {
        console.error('❌ Error al cargar resumen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [idUsuario]);

  if (loading) {
    return (
      <div style={{
        background: '#FFF1E0',
        borderRadius: '1.5rem',
        padding: '20px',
        marginTop: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color: '#555', fontSize: '1rem' }}>Cargando resumen...</p>
      </div>
    );
  }

  if (!resumen || resumen.actividadesCompletadas === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD580 100%)',
        borderRadius: '1.5rem',
        padding: '20px',
        marginTop: '30px',
        textAlign: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          marginBottom: '15px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          🎯 ¡Comienza tu aventura de aprendizaje!
        </h3>
        <p style={{ fontSize: '16px', color: '#555' }}>
          Aún no has completado ninguna actividad. ¡Empieza a jugar para ver tu progreso!
        </p>
      </div>
    );
  }

  // Calcular tiempo en formato legible
  const horas = Math.floor(resumen.tiempoTotalMinutos / 60);
  const minutos = resumen.tiempoTotalMinutos % 60;
  const tiempoTexto = horas > 0 
    ? `${horas}h ${minutos}m` 
    : `${minutos} min`;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD580 100%)',
      borderRadius: '1.5rem',
      padding: '20px',
      marginTop: '20px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: '#FFA500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Trophy size={28} />
        </div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          margin: 0,
          color: '#333'
        }}>
          Resumen General de Progreso
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {/* Actividades Completadas */}
        <div style={{
          background: '#FFF1E0',
          borderRadius: '1.5rem',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        >
          <div style={{
            background: '#FFE5B4',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            color: '#FFA500'
          }}>
            <Target size={30} />
          </div>
          <div style={{ 
            fontSize: '26px', 
            fontWeight: 'bold', 
            marginBottom: '5px',
            color: '#333'
          }}>
            {resumen.actividadesCompletadas}
          </div>
          <div style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>
            Actividades Completadas
          </div>
        </div>

        {/* Puntaje Promedio */}
        <div style={{
          background: '#FFF1E0',
          borderRadius: '1.5rem',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        >
          <div style={{
            background: '#FFE5B4',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            color: '#FFA500'
          }}>
            <TrendingUp size={30} />
          </div>
          <div style={{ 
            fontSize: '26px', 
            fontWeight: 'bold', 
            marginBottom: '5px',
            color: '#333'
          }}>
            {resumen.promedioPuntaje}%
          </div>
          <div style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>
            Puntaje Promedio
          </div>
        </div>

        {/* Puntaje Total */}
        <div style={{
          background: '#FFF1E0',
          borderRadius: '1.5rem',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        >
          <div style={{
            background: '#FFE5B4',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            color: '#FFA500'
          }}>
            <Trophy size={30} />
          </div>
          <div style={{ 
            fontSize: '26px', 
            fontWeight: 'bold', 
            marginBottom: '5px',
            color: '#333'
          }}>
            {resumen.totalPuntaje}
          </div>
          <div style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>
            Puntos Totales
          </div>
        </div>

        {/* Tiempo Total */}
        <div style={{
          background: '#FFF1E0',
          borderRadius: '1.5rem',
          padding: '25px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        >
          <div style={{
            background: '#FFE5B4',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            color: '#FFA500'
          }}>
            <Clock size={30} />
          </div>
          <div style={{ 
            fontSize: '26px', 
            fontWeight: 'bold', 
            marginBottom: '5px',
            color: '#333'
          }}>
            {tiempoTexto}
          </div>
          <div style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>
            Tiempo de Aprendizaje
          </div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div style={{
        marginTop: '25px',
        padding: '20px',
        background: '#FFF1E0',
        borderRadius: '1.5rem',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {resumen.promedioPuntaje === 100 ? (
          <span>🌟 ¡Excelente trabajo! Tienes un rendimiento perfecto. ¡Sigue así!</span>
        ) : resumen.promedioPuntaje >= 80 ? (
          <span>🎉 ¡Muy bien! Estás haciendo un gran progreso. ¡Continúa aprendiendo!</span>
        ) : resumen.promedioPuntaje >= 60 ? (
          <span>💪 ¡Buen trabajo! Cada día aprendes más. ¡No te rindas!</span>
        ) : (
          <span>🚀 ¡Sigue intentándolo! Cada intento te hace más fuerte. ¡Tú puedes!</span>
        )}
      </div>
    </div>
  );
};

export default ResumenEstadisticas;