import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Importar
import "../styles/ActivityParejasAnimales.css";
import type { Actividad } from "../types/index";

interface AnimalItem {
  id: number;
  nombre: string;
  imagen: string;
  sonido: string;
  uniqueId?: number;
}

interface Props {
  actividad: Actividad;
}

const ActivityParejasAnimales = ({ actividad }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Obtener usuario

  const animalesBase: AnimalItem[] = [
    { id: 1, nombre: "Perro", imagen: "/assets/perro.jpg", sonido: "/assets/audio/perro.mp3" },
    { id: 2, nombre: "Gato", imagen: "/assets/gato.jpg", sonido: "/assets/audio/gato.mp3" },
    { id: 3, nombre: "Vaca", imagen: "/assets/vaca.jpg", sonido: "/assets/audio/vaca.mp3" },
    { id: 4, nombre: "Pato", imagen: "/assets/pato.jpg", sonido: "/assets/audio/pato.mp3" },
    { id: 5, nombre: "Oveja", imagen: "/assets/oveja.jpg", sonido: "/assets/audio/oveja.mp3" },
    { id: 6, nombre: "Caballo", imagen: "/assets/caballo.jpg", sonido: "/assets/audio/caballo.mp3" },
    { id: 7, nombre: "Cerdo", imagen: "/assets/cerdo.jpg", sonido: "/assets/audio/cerdo.mp3" },
    { id: 8, nombre: "Tigre", imagen: "/assets/tigre.png", sonido: "/assets/audio/tigre.mp3" },
    { id: 9, nombre: "Elefante", imagen: "/assets/elefante.jpg", sonido: "/assets/audio/elefante.mp3" },
    { id: 10, nombre: "Mono", imagen: "/assets/mono.jpg", sonido: "/assets/audio/mono.mp3" },
    { id: 11, nombre: "Gallo", imagen: "/assets/gallo.jpg", sonido: "/assets/audio/gallo.mp3" },
    { id: 12, nombre: "Loro", imagen: "/assets/loro.jpg", sonido: "/assets/audio/loro.mp3" }
  ];

  const animalesMezclados = [...animalesBase, ...animalesBase]
    .map((item, index) => ({ ...item, uniqueId: index + 1 }))
    // eslint-disable-next-line react-hooks/purity
    .sort(() => Math.random() - 0.5);

  const [tarjetas] = useState(animalesMezclados);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [encontradas, setEncontradas] = useState<number[]>([]);
  const [bloquear, setBloquear] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");
  const [modalMensaje, setModalMensaje] = useState("");

  // ✅ Estados para tracking de progreso
  const [tiempoInicio] = useState(Date.now());
  const [progresoGuardado, setProgresoGuardado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  // ✅ Función para guardar progreso
  const guardarProgreso = async (completada: boolean) => {
    if (!user || progresoGuardado) return;

    const tiempoEmpleado = Math.floor((Date.now() - tiempoInicio) / 1000);
    const parejasEncontradas = encontradas.length;
    const puntaje = Math.floor((parejasEncontradas / animalesBase.length) * 100);

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
      console.log('✅ Progreso guardado correctamente');
    } catch (error) {
      console.error('❌ Error al guardar progreso:', error);
    }
  };

  // ✅ Verificar si encontró todas las parejas
  useEffect(() => {
    if (encontradas.length === animalesBase.length && !progresoGuardado) {
      guardarProgreso(true);
    }
  }, [encontradas]);

  // ✅ Guardar progreso cuando salga de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!progresoGuardado && encontradas.length > 0) {
        guardarProgreso(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [encontradas, progresoGuardado]);

  const seleccionarTarjeta = (uniqueId: number, idAnimal: number) => {
    if (bloquear || seleccionadas.includes(uniqueId) || encontradas.includes(idAnimal)) return;

    const nuevas = [...seleccionadas, uniqueId];
    setSeleccionadas(nuevas);

    if (nuevas.length === 2) {
      setBloquear(true);
      
      // ✅ Incrementar intentos
      setIntentos(prev => prev + 1);

      const [a, b] = nuevas;
      const animalA = tarjetas.find(t => t.uniqueId === a)!;
      const animalB = tarjetas.find(t => t.uniqueId === b)!;

      if (animalA.id === animalB.id) {
        // -------- ACIERTO --------
        setEncontradas(prev => [...prev, animalA.id]);
        setModalMensaje("¡Correcto!");
        setModalImage("happy");
        setModalVisible(true);

        // 🔊 REPRODUCIR SONIDO DEL ANIMAL
        const audio = new Audio(animalA.sonido);
        audio.play();

        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          setModalVisible(false);
        }, 7000);

      } else {
        // -------- ERROR --------
        setModalMensaje("Incorrecto");
        setModalImage("sad");
        setModalVisible(true);

        setTimeout(() => setModalVisible(false), 1000);
      }

      // Reset selección
      setTimeout(() => {
        setSeleccionadas([]);
        setBloquear(false);
      }, 800);
    }
  };

  return (
    <div className="dashboard-background min-h-screen p-6 flex flex-col">

      <button
        className="btn-dashboard flex items-center gap-2"
        onClick={() => {
          // ✅ Guardar progreso antes de salir
          if (!progresoGuardado && encontradas.length > 0) {
            guardarProgreso(false);
          }
          navigate("/actividad");
        }}
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <h2 className="nombre2">{actividad.nombre}</h2>

      {/* ✅ Indicador de progreso */}
      {encontradas.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          Progreso: {encontradas.length} de {animalesBase.length} parejas encontradas
          {encontradas.length === animalesBase.length && " 🎉 ¡Completado!"}
        </div>
      )}

      <div className="card mt-6 text-center flex-1">
        <p className="descripcion-colores">{actividad.descripcion}</p>
        <p className="pronunciation2">!!!!!! Comencemos !!!!!!</p>

        <div className="grid-parejas">
          {tarjetas.map(t => {
            const volteada =
              seleccionadas.includes(t.uniqueId!) ||
              encontradas.includes(t.id);

            return (
              <div
                key={t.uniqueId}
                className={`card-memoria ${volteada ? "volteada" : ""}`}
                onClick={() => seleccionarTarjeta(t.uniqueId!, t.id)}
              >
                <div className="lado frente"></div>

                <div className="lado atras">
                  <img src={t.imagen} alt={t.nombre} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
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

export default ActivityParejasAnimales;