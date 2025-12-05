import { useEffect, useState } from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface Actividad {
  idActividad: number;
  nombre: string;
  tipo: string;
  nivel: string;
}

interface ProgresoData {
  idProgreso: number;
  idUsuario: number;
  idActividad: number;
  fechaInicio: string;
  fechaCompletada: string | null;
  puntajeObtenido: number;
  tiempoEmpleado: number;
  completada: boolean;
  intentos: number;
  actividad: {
    idActividad: number;
    nombre: string;
    tipo: string;
    nivel: string;
  };
}

interface EstadisticaActividad {
  nombreActividad: string;
  completadas: number;
  enProgreso: number;
  sinIniciar: number;
  totalIntentos: number;
}

interface Props {
  idUsuario: number;
}

const EstadisticasChart = ({ idUsuario }: Props) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticaActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);
        console.log('🔍 Buscando estadísticas para usuario:', idUsuario);

        // 1. Obtener todas las actividades
        const resActividades = await fetch('https://fundacionlatidosdown.azurewebsites.net/api/Actividades');
        if (!resActividades.ok) throw new Error('Error al cargar actividades');
        const actividades: Actividad[] = await resActividades.json();
        console.log('📋 Actividades cargadas:', actividades);

        // 2. Obtener el progreso del usuario
        const resProgreso = await fetch(`https://fundacionlatidosdown.azurewebsites.net/api/Progreso/usuario/${idUsuario}`);
        if (!resProgreso.ok) throw new Error('Error al cargar progreso');
        const progreso: ProgresoData[] = await resProgreso.json();
        console.log('📊 Progreso cargado:', progreso);

        // 3. Calcular estadísticas para cada actividad
        const stats: EstadisticaActividad[] = actividades.map((act) => {
          // Filtrar todos los intentos de esta actividad
          const intentosActividad = progreso.filter((p) => p.idActividad === act.idActividad);

          // Contar completadas
          const completadas = intentosActividad.filter((p) => p.completada).length;

          // Contar en progreso (iniciadas pero no completadas)
          const enProgreso = intentosActividad.filter((p) => !p.completada).length;

          // Si no hay ningún intento, está sin iniciar
          const sinIniciar = intentosActividad.length === 0 ? 1 : 0;

          return {
            nombreActividad: act.nombre,
            completadas,
            enProgreso,
            sinIniciar,
            totalIntentos: intentosActividad.length
          };
        });

        console.log('✅ Estadísticas calculadas:', stats);
        setEstadisticas(stats);
        setError('');
      } catch (err) {
        console.error('❌ Error al cargar estadísticas:', err);
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, [idUsuario]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #ff7a00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '10px', color: '#666' }}>Cargando estadísticas...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        background: '#fee',
        borderRadius: '8px',
        color: '#c00'
      }}>
        <p style={{ fontWeight: 'bold' }}>⚠️ {error}</p>
        <p style={{ fontSize: '12px', marginTop: '5px' }}>
          Verifica que el backend esté funcionando
        </p>
      </div>
    );
  }

  if (estadisticas.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <p style={{ fontSize: '16px', color: '#666' }}>📊 No hay actividades registradas</p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          ¡Comienza a jugar para ver tu progreso!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '15px'
    }}>
      {estadisticas.map((stat, index) => {
        const data = {
          labels: ['✅ Completadas', '⏳ En Progreso', '❌ Sin Iniciar'],
          datasets: [{
            data: [stat.completadas, stat.enProgreso, stat.sinIniciar],
            backgroundColor: [
              'rgba(108, 235, 154, 0.8)',
              '#f4f271ff',
              '#f6a7a7ff',
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              '#dfdc24ff',
              '#E57373',
            ],
            borderWidth: 2,
          }],
        };

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                font: { size: 10 },
                padding: 8,
                boxWidth: 12,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 10,
              callbacks: {
                label: (context: any) => {
                  return `${context.label}: ${context.parsed} ${context.parsed === 1 ? 'vez' : 'veces'}`;
                },
                afterBody: () => {
                  return stat.totalIntentos > 0 
                    ? `Total de intentos: ${stat.totalIntentos}`
                    : 'Aún no has jugado';
                }
              },
            },
          },
          scales: {
            r: {
              beginAtZero: true,
              ticks: { 
                stepSize: 1,
                font: { size: 9 }
              },
            },
          },
        };

        // Determinar badge
        let badge = '';
        let badgeColor = '';
        
        if (stat.sinIniciar > 0) {
          badge = '⚪ Sin Iniciar';
          badgeColor = '#94a3b8';
        } else if (stat.completadas > 0) {
          badge = `✅ ${stat.completadas} Completada${stat.completadas > 1 ? 's' : ''}`;
          badgeColor = '#22c55e';
        } else if (stat.enProgreso > 0) {
          badge = '⏳ En Progreso';
          badgeColor = '#fbbf24';
        }

        return (
          <div key={index} style={{
            background: '#fff',
            padding: '15px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333',
                margin: 0,
                flex: 1
              }}>
                {stat.nombreActividad}
              </h4>
              <span style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: `${badgeColor}20`,
                color: badgeColor,
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {badge}
              </span>
            </div>
            
            <div style={{ height: '200px' }}>
              <PolarArea data={data} options={options} />
            </div>

            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #e5e7eb',
              fontSize: '11px',
              color: '#666',
              textAlign: 'center'
            }}>
              Total de intentos: <strong>{stat.totalIntentos}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EstadisticasChart;
