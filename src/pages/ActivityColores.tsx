import type { Actividad } from "../types/index";
import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/ActivityColors.css";

interface ColorItem {
  id: number;
  nombre: string;
  colorHex: string;
}

interface Props {
  actividad: Actividad;
}

const ActivityColores = ({ actividad }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seleccion, setSeleccion] = useState<{ [key: number]: string }>({});
  const [correctos, setCorrectos] = useState<{ [key: number]: boolean }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");
  const [modalMensaje, setModalMensaje] = useState<string>("");

  const [tiempoInicio] = useState(Date.now());
  const [progresoGuardado, setProgresoGuardado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  //  NUEVO: Estado para el modal de instrucciones
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true);

  const colores: ColorItem[] = [
    { id: 1, nombre: "Rojo", colorHex: "#FF0000" },
    { id: 2, nombre: "Verde", colorHex: "#00FF00" },
    { id: 3, nombre: "Azul", colorHex: "#0000FF" },
    { id: 4, nombre: "Amarillo", colorHex: "#FFFF00" },
    { id: 5, nombre: "Naranja", colorHex: "#FFA500" },
    { id: 6, nombre: "Morado", colorHex: "#800080" },
    { id: 7, nombre: "Rosa", colorHex: "#FFC0CB" },
    { id: 8, nombre: "Negro", colorHex: "#000000" },
    { id: 9, nombre: "Celeste", colorHex: "#87CEEB" },
    { id: 10, nombre: "Gris", colorHex: "#808080" },
  ];

  const shuffledImages = [...colores].sort(() => Math.random() - 0.5);

  const reproducirAudioColor = (nombreColor: string) => {
    const audio = new Audio(`/assets/audio/${nombreColor.toLowerCase()}.mp3`);
    audio.play().catch(err => console.error('Error al reproducir audio:', err));
  };

  const guardarProgreso = async (completada: boolean) => {
    if (!user || progresoGuardado) return;

    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000);
    const coloresCorrectos = Object.values(correctos).filter(Boolean).length;
    const puntaje = Math.floor((coloresCorrectos / colores.length) * 100);

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
          intentos: intentos
        })
      });

      setProgresoGuardado(true);
      console.log(' Progreso guardado correctamente');
    } catch (error) {
      console.error(' Error al guardar progreso:', error);
    }
  };

  useEffect(() => {
    const coloresCorrectos = Object.values(correctos).filter(Boolean).length;
    
    if (coloresCorrectos === colores.length && !progresoGuardado) {
      guardarProgreso(true);
    }
  }, [correctos]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const coloresCorrectos = Object.values(correctos).filter(Boolean).length;
      if (!progresoGuardado && coloresCorrectos > 0) {
        guardarProgreso(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [correctos, progresoGuardado]);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    const colorId = parseInt(e.dataTransfer.getData("text/plain"));
    const color = colores.find(c => c.id === colorId)!;

    setIntentos(prev => prev + 1);

    if (colorId === id) {
      setSeleccion(prev => ({ ...prev, [id]: color.nombre }));
      setCorrectos(prev => ({ ...prev, [id]: true }));
      setModalMensaje("¡Correcto!");
      setModalImage("happy");
      
      reproducirAudioColor(color.nombre);
    } else {
      setModalMensaje("Incorrecto.");
      setModalImage("sad");
    }

    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 1000);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const verificarRespuestas = () => {
    let correctas = 0;
    colores.forEach(c => {
      if (seleccion[c.id] === c.nombre) correctas++;
    });

    if (correctas === colores.length) {
      guardarProgreso(true);
    }

    setModalMensaje(`Has acertado ${correctas} de ${colores.length}`);
    setModalImage(correctas === colores.length ? "happy" : "sad");
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 1500);
  };

  return (
    <div className="dashboard-background min-h-screen p-6 flex flex-col">
      
      {/* MODAL DE INSTRUCCIONES */}
      {mostrarInstrucciones && (
        <div className="modal-instrucciones-overlay">
          <div className="modal-instrucciones-content">
            <div className="modal-instrucciones-header">
              <h2>🎨 ¡Vamos a Aprender los Colores!</h2>
            </div>
            
            <div className="modal-instrucciones-body">
              <p className="instruccion-texto">
                🖼️ <strong>Arrastra cada imagen</strong> al cuadro del color correcto
              </p>
              <p className="instruccion-texto">
                👆 <strong>O presiona el botón</strong> con el nombre del color
              </p>
              <p className="instruccion-texto">
                🔊 Escucha el nombre del color cuando aciertes
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
        className="btn-dashboard mb-6 flex items-center gap-2 px-4 py-2 text-base sm:px-5 sm:py-2 sm:text-lg md:px-6 md:py-3 md:text-xl"
        onClick={() => {
          const coloresCorrectos = Object.values(correctos).filter(Boolean).length;
          if (!progresoGuardado && coloresCorrectos > 0) {
            guardarProgreso(false);
          }
          navigate("/actividad");
        }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <h2 className="nombre2">{actividad.nombre}</h2>

      {Object.values(correctos).filter(Boolean).length > 0 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#666'
        }}>
          Progreso: {Object.values(correctos).filter(Boolean).length} de {colores.length} colores correctos
          {Object.values(correctos).filter(Boolean).length === colores.length && " 🎉 ¡Completado!"}
        </div>
      )}

      <div className="card mt-6 text-center flex-1">
        <p className="descripcion-colores">{actividad.descripcion}</p>
        <p className="pronunciation1">
          Arrastra la imagen del color al cuadrado con la palabra correspondiente:
        </p>

        <div className="colores-container">
          {colores.map(color => (
            <div key={color.id} className="color-card">
              <div className="color-left">
                <div
                  className="color-box"
                  onDrop={e => handleDrop(e, color.id)}
                  onDragOver={handleDragOver}
                  style={{
                    backgroundColor: correctos[color.id] ? hexToRgba(color.colorHex, 0.3) : "#f0f0f0",
                    borderColor: correctos[color.id] ? color.colorHex : "#ccc",
                    color: "#000",
                  }}
                >
                  {color.nombre}
                </div>

                <button
                  className="btn-dashboard color-btn"
                  onClick={() => {
                    setSeleccion(prev => ({ ...prev, [color.id]: color.nombre }));
                    setCorrectos(prev => ({ ...prev, [color.id]: true }));
                    setIntentos(prev => prev + 1);
                    
                    reproducirAudioColor(color.nombre);
                  }}
                  style={{
                    backgroundColor: correctos[color.id] ? hexToRgba(color.colorHex, 0.3) : "#ff7a00",
                    color: "#000",
                  }}
                >
                  <Check size={16} /> {color.nombre}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="imagenes-colores mt-6 flex flex-wrap justify-center gap-4">
          {shuffledImages.map(color => (
            <img
              key={color.id}
              src={`/assets/${color.nombre.toLowerCase()}.png`}
              alt={color.nombre}
              draggable={!correctos[color.id]}
              onDragStart={e => handleDragStart(e, color.id)}
              className="color-img"
            />
          ))}
        </div>
      </div>

      <footer className="mt-4 flex justify-end">
        <button
          id="btn-verificar"
          className="btn-dashboardVerificar"
          onClick={verificarRespuestas}
        >
          Verificar respuestas
        </button>
      </footer>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <img
              src={modalImage === "happy" ? "/assets/happy.png" : "/assets/sad.png"}
              alt="resultado"
              className="modal-image-small"
            />
            <p className={modalImage === "happy" ? "mensaje-correcto" : "mensaje-incorrecto"}>
              {modalMensaje}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityColores;