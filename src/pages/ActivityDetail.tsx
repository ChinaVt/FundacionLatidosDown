import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActivityColores from "./ActivityColores";
import ActivityVocales from "./ActivityVocales";
import type { Actividad } from "../types/index";
import ActivityParejasAnimales from "./ActivityParejasAnimales";
import ActivityCuentoPatito from "./ActivityCuentoPatito";
import ActivityAbecedario from "./ActivityAbecedario";
import ActivityRompecabezas from "./ActivityRompecabezas";

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`https://fundacionlatidosdown.azurewebsites.net/api/Actividades/${id}`)
      .then(res => res.json())
      .then((data: Actividad) => setActividad(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-8">Cargando actividad...</p>;
  if (!actividad) return <p className="text-center mt-8">Actividad no encontrada</p>;

  const tipo = actividad.tipo?.toLowerCase().trim() || "";

console.log("TIPO RECIBIDO:", tipo);

switch (tipo) {
    case "colores":
    case "asociacion":
      return <ActivityColores actividad={actividad} />;

    case "vocales":
    case "pronunciacion":  
      return <ActivityVocales actividad={actividad} />;

     // Parejas / memoria / animales (nuevo ActivityParejasAnimales)
    case "parejas":
    case "parejas animales":
    case "memoria":
    case "animales":
      return <ActivityParejasAnimales actividad={actividad} />;
    
    case "cuento":
    case "patito":
    case "lectura":
      return <ActivityCuentoPatito actividad={actividad} />;

    case "cancion":
    case "abecedario":
    case "aprende cantando":
      return <ActivityAbecedario actividad={actividad} />;
    
    case "juego":
    case "puzzle":
    case "rompe cabezas":
    case "armar imagen":
      return <ActivityRompecabezas actividad={actividad} />;



    default:
      return <p className="text-center mt-8">Tipo de actividad no soportado: {tipo}</p>;
  }
};

export default ActivityDetail;
