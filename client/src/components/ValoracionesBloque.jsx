import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ValoracionesBloque.css"; // Estilos opcionales

const ValoracionesBloque = ({ tmdb_id, tipo, tmdb_score, trigger }) => {
  const [mediaUsuarios, setMediaUsuarios] = useState(null);
  const [miValoracion, setMiValoracion] = useState(null);

  useEffect(() => {
    const fetchValoraciones = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/valoraciones/resumen/${tipo}/${tmdb_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMediaUsuarios(res.data.mediaUsuarios);
        setMiValoracion(res.data.miValoracion);
      } catch (error) {
        console.error("Error al obtener resumen de valoraciones:", error);
      }
    };

    fetchValoraciones();
  }, [tmdb_id, tipo, trigger]);

  return (
    <div className="valoraciones-bloque d-flex gap-4 align-items-center flex-wrap">
      <div>
        <strong>⭐ TMDb:</strong> {tmdb_score?.toFixed(1) ?? "N/A"}
      </div>
      <div>
        <strong>👥 Usuarios:</strong> {mediaUsuarios ?? "Sin datos"}
      </div>
      <div>
        <strong>🧍 Tú:</strong> {miValoracion ?? "Sin valorar"}
      </div>
    </div>
  );
};

export default ValoracionesBloque;
