import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Actividad } from "../types";
import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import "../styles/ActivityCuentoPatito.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  actividad: Actividad;
}

const paginasCuento = [
  {
    texto: "",
    tiempoInicio: 0,
    tiempoFin: 0,
    numeroPagina: 1,
    esPortada: true,
    duracion: 0 // No tiene duración, se avanza manualmente
  },
  {
    texto: "Había una vez un patito muy diferente a sus hermanos. Todos se burlaban de él.",
    tiempoInicio: 0,
    tiempoFin: 8,
    numeroPagina: 2,
    esPortada: false,
    duracion: 8
  },
  {
    texto: "El patito se sentía muy triste y decidió alejarse.",
    tiempoInicio: 8,
    tiempoFin: 16,
    numeroPagina: 3,
    esPortada: false,
    duracion: 8
  },
  {
    texto: "Después de un tiempo, creció y se transformó en un hermoso cisne.",
    tiempoInicio: 15,
    tiempoFin: 23,
    numeroPagina: 4,
    esPortada: false,
    duracion: 8
  },
  {
    texto: "Ahora el patito feo sabía que era especial desde el principio. Solo necesitaba tiempo para descubrirlo",
    tiempoInicio: 23,
    tiempoFin: 34,
    numeroPagina: 5,
    esPortada: false,
    duracion: 11
  },
  {
    texto: "",
    tiempoInicio: 0,
    tiempoFin: 0,
    numeroPagina: 6,
    esPortada: false,
    esPaginaFinal: true,
    duracion: 0
  }
];

const ActivityCuentoPatito = ({ actividad }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paginaActual, setPaginaActual] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [tiempoInicio] = useState(Date.now());
  const [progresoGuardado, setProgresoGuardado] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [cuentoIniciado, setCuentoIniciado] = useState(false);

  const guardarProgreso = async () => {
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
          fechaCompletada: new Date().toISOString(),
          puntajeObtenido: 100,
          tiempoEmpleado: tiempoEmpleado,
          completada: true,
          intentos: 1
        })
      });

      setProgresoGuardado(true);
      console.log('✅ Progreso guardado correctamente');
    } catch (error) {
      console.error('❌ Error al guardar progreso:', error);
    }
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const avanzarPagina = () => {
    if (paginaActual < paginasCuento.length - 1) {
      setPaginaActual(prev => prev + 1);
    } else {
      // Terminó el cuento
      setReproduciendo(false);
      guardarProgreso();
    }
  };

  const reproducirPagina = async (indicePagina: number) => {
    const pagina = paginasCuento[indicePagina];

    // Si es portada o página final, avanzar automáticamente
    if (pagina.esPortada || pagina.esPaginaFinal) {
      if (pagina.esPaginaFinal) {
        setReproduciendo(false);
        guardarProgreso();
      }
      return;
    }

    // Reproducir audio de la página
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = pagina.tiempoInicio;
        
        await audioRef.current.play();
        console.log(`🔊 Reproduciendo página ${indicePagina + 1}`);

        // Esperar a que termine el audio y avanzar
        timeoutRef.current = setTimeout(() => {
          audioRef.current?.pause();
          avanzarPagina();
        }, pagina.duracion * 1000);

      } catch (error) {
        console.error('❌ Error al reproducir audio:', error);
        setReproduciendo(false);
      }
    }
  };

  // Reproducir automáticamente cuando cambia la página (si está en modo reproducción)
  useEffect(() => {
    if (reproduciendo && paginaActual > 0) {
      reproducirPagina(paginaActual);
    }
  }, [paginaActual, reproduciendo]);

  const iniciarCuento = () => {
    setCuentoIniciado(true);
    setReproduciendo(true);
    setPaginaActual(1); // Saltar de portada a primera página con audio
  };

  const pausarCuento = () => {
    setReproduciendo(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const reanudarCuento = () => {
    setReproduciendo(true);
    reproducirPagina(paginaActual);
  };

  const reiniciarCuento = () => {
    pausarCuento();
    setPaginaActual(0);
    setCuentoIniciado(false);
    setReproduciendo(false);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    console.log(`📄 PDF cargado con ${numPages} páginas`);
  };

  const esPortada = paginasCuento[paginaActual].esPortada;
  const esPaginaFinal = paginasCuento[paginaActual].esPaginaFinal;

  return (
    <div className="dashboard-background min-h-screen p-6">

      <button
        className="btn-dashboard mb-6 flex items-center gap-2"
        onClick={() => {
          pausarCuento();
          navigate("/actividad");
        }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <h2 className="nombre-cuento">{actividad.nombre}</h2>

      <div className="card-cuento text-center mt-6">

        <p className="descripcion-cuento">{actividad.descripcion}</p>

        <div className="cuento-pagina">
          <Document
            file="/public/assets/cuento/patitofeo.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('❌ Error al cargar PDF:', error)}
            loading={
              <div style={{ 
                width: '100%', 
                height: '380px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f0f0f0',
                borderRadius: '16px'
              }}>
                <p>Cargando cuento...</p>
              </div>
            }
          >
            <Page
              pageNumber={paginasCuento[paginaActual].numeroPagina}
              width={700}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          <audio 
            ref={audioRef} 
            preload="metadata"
            onLoadedMetadata={() => console.log('🎵 Audio cargado correctamente')}
            onError={(e) => console.error('❌ Error al cargar audio:', e)}
          >
            <source src="/public/assets/audio/historiaPatitoFeo.mp3" type="audio/mpeg" />
          </audio>

          {esPaginaFinal ? (
            <p className="fin-cuento" style={{ marginTop: '20px' }}>
              ¡Gracias! 😊
            </p>
          ) : (
            !esPortada && paginasCuento[paginaActual].texto && (
              <p className="cuento-texto">
                {paginasCuento[paginaActual].texto}
              </p>
            )
          )}
        </div>

        {/* ✅ Controles del cuento */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          {esPortada && !cuentoIniciado ? (
            // Botón Comenzar en la portada
            <button 
              className="btn-dashboard btn-avanzar flex items-center justify-center gap-2"
              onClick={iniciarCuento}
            >
              <Play size={24} /> Comenzar Cuento
            </button>
          ) : esPaginaFinal ? (
            // Botón Reiniciar en la página final
            <>
              <button 
                className="btn-dashboard flex items-center justify-center gap-2"
                onClick={reiniciarCuento}
              >
                <RotateCcw size={20} /> Ver de Nuevo
              </button>
              {progresoGuardado && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#4caf50', 
                  marginTop: '10px',
                  fontWeight: 'bold',
                  width: '100%'
                }}>
                  ✅ Progreso guardado
                </p>
              )}
            </>
          ) : (
            // Botones Pausar/Reanudar durante la reproducción
            <>
              {reproduciendo ? (
                <button 
                  className="btn-dashboard flex items-center justify-center gap-2"
                  onClick={pausarCuento}
                >
                  <Pause size={20} /> Pausar
                </button>
              ) : (
                <button 
                  className="btn-dashboard flex items-center justify-center gap-2"
                  onClick={reanudarCuento}
                >
                  <Play size={20} /> Continuar
                </button>
              )}
              
              <button 
                className="btn-dashboard flex items-center justify-center gap-2"
                onClick={reiniciarCuento}
              >
                <RotateCcw size={20} /> Reiniciar
              </button>
            </>
          )}
        </div>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Página {paginaActual + 1} de {paginasCuento.length}
        </p>
      </div>
    </div>
  );
};

export default ActivityCuentoPatito;