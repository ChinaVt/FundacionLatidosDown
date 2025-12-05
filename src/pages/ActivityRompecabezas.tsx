import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // ✅ Importar
import "../styles/ActivityRompecabezas.css";

interface Props {
  actividad: {
    idActividad: number; // ✅ Asegúrate de que esté en el tipo
    nombre: string;
    descripcion: string;
  };
}

interface Pieza {
  id: number;
  row: number;
  col: number;
  placed: boolean;
}

interface Nivel {
  imagen: string;
  nombre: string;
  rows: number;
  cols: number;
}

const ActivityRompecabezas = ({ actividad }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Obtener usuario

  const niveles: Nivel[] = [
    {
      imagen: "/assets/animales.jpg",
      nombre: "Animales del Zoológico",
      rows: 4, //Cambio de 5, 6 que contenia 30 piezas ahora contiene 4,5 de 20 piezas
      cols: 5,
    },
    {
      imagen: "/assets/frutas.png",
      nombre: "Tipo de Frutas",
      rows: 3, //Cambio de 4, 5 que contenia 20 piezas ahora contiene 3,4 de 12 piezas
      cols: 4,
    },
    {
      imagen: "/assets/planetas.jpg",
      nombre: "Misterios del Espacio",
      rows: 4, //Cambio de 5, 6 que contenia 30 piezas ahora contiene 4,5 de 20 piezas
      cols: 5,
    },
  ];

  const [nivelActual, setNivelActual] = useState(0);
  const [pieces, setPieces] = useState<Pieza[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");
  const [modalMensaje, setModalMensaje] = useState<string>("");
  const boardRef = useRef<HTMLDivElement | null>(null);

  // ✅ Estados para tracking de progreso
  const [tiempoInicio] = useState(Date.now());
  const [progresoGuardado, setProgresoGuardado] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [nivelesCompletados, setNivelesCompletados] = useState(0);

  const nivel = niveles[nivelActual];
  const bgUrl = nivel.imagen;
  const rows = nivel.rows;
  const cols = nivel.cols;

  const boardW = 510;
  const boardH = 410;
  const pieceW = boardW / cols;
  const pieceH = boardH / rows;

  // ✅ Función para guardar progreso
  const guardarProgreso = async (completada: boolean) => {
    if (!user || progresoGuardado) return;

    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000);
    const puntaje = Math.floor((nivelesCompletados / niveles.length) * 100);

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
          intentos: intentosFallidos
        })
      });

      setProgresoGuardado(true);
      console.log('✅ Progreso guardado correctamente');
    } catch (error) {
      console.error('❌ Error al guardar progreso:', error);
    }
  };

  // ✅ Guardar progreso cuando salga de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!progresoGuardado && nivelesCompletados > 0) {
        guardarProgreso(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [nivelesCompletados, progresoGuardado]);

  useEffect(() => {
    inicializarPiezas();
  }, [nivelActual]);

  const inicializarPiezas = () => {
    const temp: Pieza[] = [];
    let id = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        temp.push({
          id,
          row: r,
          col: c,
          placed: false,
        });
        id++;
      }
    }

    for (let i = temp.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [temp[i], temp[j]] = [temp[j], temp[i]];
    }

    setPieces(temp);
  };

  const verificarCompletado = (piezasActualizadas: Pieza[]) => {
    const todasColocadas = piezasActualizadas.every(p => p.placed);
    
    if (todasColocadas) {
      // ✅ Incrementar niveles completados
      const nuevosNivelesCompletados = nivelesCompletados + 1;
      setNivelesCompletados(nuevosNivelesCompletados);

      if (nivelActual < niveles.length - 1) {
        // 🎉 Completó un nivel, pero hay más
        setModalMensaje("¡Muy bien hecho! Siguiente nivel...");
        setModalImage("bien");
        setModalVisible(true);
        
        setTimeout(() => {
          setModalVisible(false);
          setNivelActual(prev => prev + 1);
        }, 2000);
        
      } else {
        // 🏆 Completó TODOS los niveles
        guardarProgreso(true); // ✅ Guardar como completada
        
        setModalMensaje("¡Felicidades! Completaste todos los rompecabezas");
        setModalImage("bien");
        setModalVisible(true);
        
        setTimeout(() => {
          setModalVisible(false);
          navigate("/actividad");
        }, 3500);
      }
    }
  };

  const handleDropPiece = (e: React.DragEvent<HTMLDivElement>, pieceId: number) => {
    e.preventDefault();
    
    if (!boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const dropX = e.clientX - boardRect.left;
    const dropY = e.clientY - boardRect.top;

    const colDropped = Math.floor(dropX / pieceW);
    const rowDropped = Math.floor(dropY / pieceH);

    const pieza = pieces.find(p => p.id === pieceId);
    
    if (!pieza) return;

    if (pieza.row === rowDropped && pieza.col === colDropped) {
      // ✅ CORRECTO
      const piezasActualizadas = pieces.map((p) =>
        p.id === pieceId ? { ...p, placed: true } : p
      );
      setPieces(piezasActualizadas);
      verificarCompletado(piezasActualizadas);
      
    } else {
      // ❌ INCORRECTO
      setIntentosFallidos(prev => prev + 1); // ✅ Incrementar intentos fallidos
      
      setModalMensaje("Incorrecto");
      setModalImage("sad");
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 1000);
    }
  };

  return (
    <div className="dashboard-background min-h-screen p-6 flex flex-col">
      
      <button
        className="btn-dashboard mb-6 flex items-center gap-2"
        onClick={() => {
          // ✅ Guardar progreso antes de salir
          if (!progresoGuardado && nivelesCompletados > 0) {
            guardarProgreso(false);
          }
          navigate("/actividad");
        }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <h2 className="titulo-abc">{actividad.nombre}</h2>
      <p className="descripcion-abc">{actividad.descripcion}</p>

      {/* ✅ Indicador de nivel */}
      <div className="nivel-indicator">
        <p className="nivel-texto">
          Nivel {nivelActual + 1} de {niveles.length}: <strong>{nivel.nombre}</strong>
        </p>
      </div>

      {/* ✅ Indicador de progreso de piezas */}
      <div style={{
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '14px',
        color: '#666'
      }}>
        Piezas colocadas: {pieces.filter(p => p.placed).length} de {pieces.length}
      </div>

      <div className="card-abc mt-6">

        {/* PANEL IZQUIERDO - PIEZAS */}
        <div className="left-panel card-video">
          <p className="subtitulo-abc">Piezas</p>

          <div className="piezas-list">
            {pieces.map((p) =>
              p.placed ? null : (
                <div
                  key={p.id}
                  className="pieza-suelta"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("pieceId", String(p.id));
                  }}
                  style={{
                    width: `${pieceW}px`,
                    height: `${pieceH}px`,
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: `${boardW}px ${boardH}px`,
                    backgroundPosition: `${-p.col * pieceW}px ${-p.row * pieceH}px`,
                  }}
                ></div>
              )
            )}
          </div>
        </div>

        {/* PANEL DERECHO — TABLERO CON CUADRÍCULA */}
        <div className="board-container">
          <div
            className="board-panel"
            ref={boardRef}
            style={{
              width: `${boardW}px`,
              height: `${boardH}px`,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const pieceId = Number(e.dataTransfer.getData("pieceId"));
              handleDropPiece(e, pieceId);
            }}
          >
            <div 
              className="board-background"
              style={{
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: `${boardW}px ${boardH}px`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>

            <svg className="grid-overlay" width={boardW} height={boardH}>
              {Array.from({ length: cols + 1 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * pieceW}
                  y1={0}
                  x2={i * pieceW}
                  y2={boardH}
                  stroke="#666"
                  strokeWidth="2"
                />
              ))}
              {Array.from({ length: rows + 1 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i * pieceH}
                  x2={boardW}
                  y2={i * pieceH}
                  stroke="#666"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {pieces.map((p) =>
              p.placed ? (
                <div
                  key={p.id}
                  className="pieza-colocada"
                  style={{
                    width: `${pieceW}px`,
                    height: `${pieceH}px`,
                    top: `${p.row * pieceH}px`,
                    left: `${p.col * pieceW}px`,
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: `${boardW}px ${boardH}px`,
                    backgroundPosition: `${-p.col * pieceW}px ${-p.row * pieceH}px`,
                  }}
                ></div>
              ) : null
            )}
          </div>
        </div>

      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <img
              src={
                modalImage === "bien" 
                  ? "/assets/bien.png" 
                  : "/assets/sad.png"
              }
              alt="resultado"
              className="modal-image-small"
            />
            <p className={modalImage === "bien" ? "mensaje-correcto" : "mensaje-incorrecto"}>
              {modalMensaje}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityRompecabezas;