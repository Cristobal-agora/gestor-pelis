import React, { useEffect, useState } from "react";

const ValoracionUsuario = ({ tmdb_id, tipo, onValoracionGuardada  }) => {
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
    if (!puntuacion || puntuacion < 1 || puntuacion > 10) {
      alert("Debes seleccionar una puntuación del 1 al 10");
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
  alert("✅ Valoración guardada");
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
    const confirm = window.confirm("¿Eliminar tu valoración?");
    if (!confirm) return;
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

  // 🔁 Notificar al padre si existe el callback
  if (onValoracionGuardada) onValoracionGuardada();
}

  };

  return (
    <div className="mt-3">
      <h6 className="text-warning mb-2 d-flex align-items-center gap-2">
        ⭐ Tu valoración:
      </h6>

      <div className="d-flex gap-2 flex-wrap align-items-center">
        {[...Array(10)].map((_, i) => (
          <button
            key={i}
            className={`btn btn-sm ${
              puntuacion === i + 1 ? "btn-primary" : "btn-outline-primary"
            }`}
            style={{ width: "34px", padding: "0.3rem 0.5rem" }}
            onClick={() => setPuntuacion(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button className="btn btn-success btn-sm" onClick={enviarValoracion}>
          💾 Guardar
        </button>

        {miValoracion && (
          <button className="btn btn-danger btn-sm" onClick={eliminarValoracion}>
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default ValoracionUsuario;
