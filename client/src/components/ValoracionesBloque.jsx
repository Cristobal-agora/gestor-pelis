import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsStarFill, BsPeopleFill, BsPersonFill } from "react-icons/bs";
import "./ValoracionesBloque.css";

const ValoracionesBloque = ({ tmdb_id, tipo, tmdb_score, trigger }) => {
  const [mediaUsuarios, setMediaUsuarios] = useState(null);
  const [miValoracion, setMiValoracion] = useState(null);

  useEffect(() => {
    const fetchValoraciones = async () => {
      const token = sessionStorage.getItem("token");
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
      <div className="d-flex align-items-center gap-1">
        <BsStarFill className="text-warning" />
        <strong>TMDb:</strong>{" "}
        {tmdb_score ? (tmdb_score / 2).toFixed(1) : "N/A"} / 5
      </div>
      <div className="d-flex align-items-center gap-1">
        <BsPeopleFill className="text-info" />
        <strong>Usuarios:</strong> {mediaUsuarios ?? "Sin datos"} / 5
      </div>
      <div className="d-flex align-items-center gap-1">
        <BsPersonFill className="text-primary" />
        <strong>Tú:</strong> {miValoracion ?? "Sin valorar"} / 5
      </div>
    </div>
  );
};

export default ValoracionesBloque;
