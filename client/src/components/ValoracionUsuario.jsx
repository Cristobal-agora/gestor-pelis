import React, { useEffect, useState } from "react";
import { BsStarFill, BsStar, BsSave, BsTrash } from "react-icons/bs";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';


const ValoracionUsuario = ({ tmdb_id, tipo, onValoracionGuardada }) => {
  const [miValoracion, setMiValoracion] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const fetchValoracion = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/valoraciones/${tipo}/${tmdb_id}/mia`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setMiValoracion(data);
      setPuntuacion(data?.puntuacion || 0);
    };
    fetchValoracion();
  }, [tmdb_id, tipo, token]);

  const enviarValoracion = async () => {
    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      toast.warn("Debes seleccionar una puntuación del 1 al 5");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/valoraciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tmdb_id, tipo, puntuacion }),
      });

      if (res.ok) {
        toast.success("Valoración guardada");
        setMiValoracion({ puntuacion });

        // 🔁 Notificar al padre si existe el callback
        if (onValoracionGuardada) onValoracionGuardada();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

 const eliminarValoracion = async () => {
  const result = await Swal.fire({
    title: '¿Eliminar valoración?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
  });

  if (!result.isConfirmed) return;

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/valoraciones/${tipo}/${tmdb_id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (res.ok) {
    setMiValoracion(null);
    setPuntuacion(0);
    toast.info("Valoración eliminada");

    if (onValoracionGuardada) onValoracionGuardada();
  } else {
    toast.error("❌ No se pudo eliminar la valoración");
  }
};


  return (
    <div className="mt-3">
      <h6 className="text-warning mb-2 d-flex align-items-center gap-2">
        ⭐ Tu valoración:
      </h6>

      <div>
        <div className="d-flex align-items-center gap-1 flex-wrap mb-2">
          {[...Array(5)].map((_, i) => {
            const valor = i + 1;
            return (
              <span
                key={valor}
                onClick={() => setPuntuacion(valor)}
                style={{
                  cursor: "pointer",
                  color: valor <= puntuacion ? "#ffc107" : "#6c757d",
                  fontSize: "1.8rem",
                  transition: "transform 0.15s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {valor <= puntuacion ? <BsStarFill /> : <BsStar />}
              </span>
            );
          })}
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={enviarValoracion}>
            <BsSave className="me-1" />
            Guardar
          </button>

          {miValoracion && (
            <button
              className="btn btn-danger btn-sm"
              onClick={eliminarValoracion}
            >
              <BsTrash className="me-1" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValoracionUsuario;
