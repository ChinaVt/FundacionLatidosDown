import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Actividad } from "../types";
import "../styles/ActivityAbecedario.css";

interface ActivityAbecedarioProps {
  actividad: Actividad;
}

const letras = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,Ñ,O,P,Q,R,S,T,U,V,W,X,Y,Z".split(",");

const tiemposLetras: Record<string, number[]> = {
  A: [12, 15, 79.8, 84],
  B: [13, 15.4, 80.5, 84.6],
  C: [13.4, 16, 81, 85.2],
  D: [14, 16.5, 81.5, 86],  

  E: [22.2, 24.6, 89, 93.8],
  F: [22.7, 25.3, 89.5, 94.3],
  G: [23.1, 25.7, 90, 94.8],
  H: [24, 26, 90.6, 95.4],

  I: [34, 36.2, 101, 106],
  J: [34.5, 36.5, 101.5, 106.7],
  K: [35, 37.3, 102, 107.3],
  L: [35.5, 38, 102.5, 107.9],

  M: [43.3, 46, 110.8, 115.8],
  N: [43.6, 46.3, 111.1, 116.1],
  Ñ: [44.1, 46.7, 111.4, 116.4],
  O: [44.4, 47, 111.7, 116.6],
  P: [44.8, 47.5, 112.1, 117],
  Q: [45, 47.9, 112.3, 117.2],

  R: [55.7, 57.8, 123, 127.8],
  S: [56, 58.2, 123.4, 128.4],
  T: [56.7, 59, 124.1, 128.9],
  U: [57, 59.3, 124.6, 129.4],

  V: [65, 67.3, 132.2, 137],
  W: [65.3, 67.7, 132.5, 137.3],
  X: [65.7, 68, 133, 137.6],
  Y: [66.3, 68.5, 133.7, 138.2],
  Z: [66.9, 69.2, 133.9, 138.7],
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const ActivityAbecedario: React.FC<ActivityAbecedarioProps> = ({ actividad }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerRef = useRef<any>(null);
  const [letraActiva, setLetraActiva] = useState("");
  
  const [letrasClicadas, setLetrasClicadas] = useState<Set<string>>(new Set());
  const [videoIniciado, setVideoIniciado] = useState(false);
  const [videoCompletado, setVideoCompletado] = useState(false);
  const [tiempoInicio] = useState(Date.now());
  const [progresoGuardado, setProgresoGuardado] = useState(false);
  
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true);

  const guardarProgreso = async (completada: boolean) => {
    if (!user || progresoGuardado) return;

    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000);

    try {
      await fetch('https://fundacionlatidosdown.azurewebsites.net/api/Progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: user.idUsuario,
          idActividad: actividad.idActividad,
          fechaInicio: new Date().toISOString(),
          fechaCompletada: completada ? new Date().toISOString() : null,
          puntajeObtenido: completada ? 100 : Math.floor((letrasClicadas.size / letras.length) * 100),
          tiempoEmpleado: tiempoEmpleado,
          completada: completada,
          intentos: letrasClicadas.size
        })
      });

      setProgresoGuardado(true);
      console.log('Progreso guardado correctamente');
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  };

  useEffect(() => {
    const todasLetrasClicadas = letrasClicadas.size === letras.length;
    
    if ((videoCompletado || todasLetrasClicadas) && !progresoGuardado) {
      guardarProgreso(true);
    }
  }, [videoCompletado, letrasClicadas, progresoGuardado]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!progresoGuardado && (letrasClicadas.size > 0 || videoIniciado)) {
        guardarProgreso(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [letrasClicadas, videoIniciado, progresoGuardado]);

  const reproducirSonido = (letra: string) => {
    const audio = new Audio(`public/assets/audios/${letra}.mp3`);
    audio.play();
    setLetrasClicadas(prev => new Set(prev).add(letra));
  };

  const iniciarMonitoreo = () => {
    setInterval(() => {
      if (!playerRef.current) return;

      const tiempoActual = playerRef.current.getCurrentTime();
      let encontrada = "";

      for (const letra in tiemposLetras) {
        const tiempos = tiemposLetras[letra];
        if (tiempos.some((t) => Math.abs(tiempoActual - t) < 0.30)) {
          encontrada = letra;
          break;
        }
      }

      setLetraActiva(encontrada);
    }, 100);
  };

  //CARGA INMEDIATA: Inicializar YouTube al montar el componente
  useEffect(() => {
    const inicializarYouTube = () => {
      // Si ya está cargado, crear reproductor
      if (window.YT && window.YT.Player) {
        crearReproductor();
        return;
      }

      // Cargar script si no existe
      const scriptExistente = document.querySelector('script[src*="youtube.com/iframe_api"]');
      
      if (!scriptExistente) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }

      // Configurar callback
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API cargada');
        crearReproductor();
      };
    };

    const crearReproductor = () => {
      if (playerRef.current) return; // No duplicar

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: "4T74P6PK1Ao",
        playerVars: {
          controls: 1,
          rel: 0,
          autoplay: 0,
          enablejsapi: 1
        },
        events: {
          onReady: iniciarMonitoreo,
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setVideoIniciado(true);
            }
            
            if (event.data === 0) {
              console.log('🎬 Video completado');
              setVideoCompletado(true);
            }
          }
        }
      });
    };

    //Delay corto para asegurar que el DOM esté listo
    const timer = setTimeout(inicializarYouTube, 100);

    return () => {
      clearTimeout(timer);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []); // Solo al montar

  return (
    <div className="dashboard-background min-h-screen p-6">

      {/* MODAL DE INSTRUCCIONES */}
      {mostrarInstrucciones && (
        <div className="modal-instrucciones-overlay">
          <div className="modal-instrucciones-content">
            <div className="modal-instrucciones-header">
              <h2>🎵 ¡Vamos a Aprender el Abecedario!</h2>
            </div>
            
            <div className="modal-instrucciones-body">
              <p className="instruccion-texto">
                 <strong>Mira el video</strong> y canta las letras
              </p>
              <p className="instruccion-texto">
                👆 <strong>Toca cada letra</strong> para escuchar su sonido
              </p>
              <p className="instruccion-texto">
                ✨ Las letras se iluminan cuando aparecen en la canción
              </p>
            </div>

            <button 
              className="btn-comenzar"
              onClick={() => setMostrarInstrucciones(false)}
            >
              ¡Comenzar! 🚀
            </button>
          </div>
        </div>
      )}

      <button
        className="btn-dashboard mb-6 flex items-center gap-2"
        onClick={() => {
          if (!progresoGuardado && (letrasClicadas.size > 0 || videoIniciado)) {
            guardarProgreso(false);
          }
          navigate("/actividad");
        }}
      >
        <ArrowLeft size={22} /> Volver
      </button>

      <h2 className="titulo-abc1">{actividad.nombre}</h2>

      {(letrasClicadas.size > 0 || videoIniciado) && (
        <div style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          {videoCompletado ? (
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
              🎉 ¡Video completado! 
            </span>
          ) : letrasClicadas.size === letras.length ? (
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
              🎉 ¡Todas las letras exploradas!
            </span>
          ) : (
            <span>
              Progreso: {letrasClicadas.size} de {letras.length} letras exploradas
              {videoIniciado && " • Video en reproducción 🎥"}
            </span>
          )}
        </div>
      )}

      <div className="card-abc mt-6" style={{ opacity: mostrarInstrucciones ? 0.3 : 1 }}>
        
        <div className="card-video">
          <p className="descripcion-abc">{actividad.descripcion}</p>
          <p className="pronunciation4">
            "Descubre cada letra bailando y cantando"
          </p>

          <div className="video-wrapper">
            {/*  El video se carga incluso con el modal abierto (en background) */}
            <div id="youtube-player" className="video-iframe"></div>
          </div>
        </div>

        <div className="card-letras">
          <div className="grid-abc">
            {letras.map((letra) => (
              <div
                key={letra}
                className={`letra-card ${letraActiva === letra ? "letra-activa" : ""} ${
                  letrasClicadas.has(letra) ? "letra-explorada" : ""
                }`}
                onClick={() => reproducirSonido(letra)}
              >
                <span className="letra-animada">{letra}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActivityAbecedario;