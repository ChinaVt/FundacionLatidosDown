import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import "../styles/ActivityPage.css";

interface Actividad {
  idActividad: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  nivel: string;
}

const ActivityPage = () => {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://fundacionlatidosdown.azurewebsites.net/api/Actividades")
      .then(res => res.json())
      .then((data: Actividad[]) => setActividades(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-8">Cargando actividades...</p>;
  if (actividades.length === 0) return <p className="text-center mt-8">No hay actividades disponibles</p>;

  return (
    <div className="dashboard-background min-h-screen p-6">
      <button
        className="btn-dashboard mb-6 flex items-center gap-2"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center">Elige una actividad</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actividades.map((act) => (
          <div
            key={act.idActividad} // ✅ key único
            className="card"
            onClick={() => navigate(`/actividad/${act.idActividad}`)}
          >
            <h3 className="text-xl font-bold mb-2">{act.nombre}</h3>
            <p className="descripcion">{act.descripcion}</p>
            <div className="flex justify-between items-center">
              <p className="tipo">Tipo: {act.tipo}</p>
              <Play size={20} className="text-orange-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
