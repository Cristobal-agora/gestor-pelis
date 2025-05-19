import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SeguimientoSerie from "../components/SeguimientoSerie";

const Historial = () => {
  const [tipo, setTipo] = useState("movie"); // 'movie' o 'tv'
  const [items, setItems] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/historial?tipo=${tipo}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const ids = await res.json();

        const detalles = await Promise.all(
          ids.map((id) =>
            fetch(
              `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${
                import.meta.env.VITE_TMDB_API_KEY
              }&language=es-ES`
            )
              .then((r) => r.json())
              .catch(() => null)
          )
        );

        setItems(detalles.filter((i) => i));
      } catch (error) {
        console.error("Error al obtener historial:", error);
      }
    };

    if (token) obtenerHistorial();
  }, [token, tipo]);

  const borrarDelHistorial = async (tmdbId) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminarlo del historial?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/historial/${tmdbId}/${tipo}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setItems(items.filter((p) => p.id !== tmdbId));
      }
    } catch (err) {
      console.error("Error al borrar del historial:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-light mb-4">🕘 Historial de Visualización</h2>

      <div className="mb-4">
        <button
          className={`btn btn-sm me-2 ${
            tipo === "movie" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setTipo("movie")}
        >
          🎬 Películas
        </button>
        <button
          className={`btn btn-sm ${
            tipo === "tv" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setTipo("tv")}
        >
          📺 Series
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-light">
          No has marcado ningún {tipo === "movie" ? "película" : "episodio"}{" "}
          como visto.
        </p>
      ) : (
        <div className="row">
          {items.map((item) => (
           <div key={item.id} className="col-md-6 mb-4">
  <div className="bg-dark p-3 rounded border border-secondary">
    <div className="d-flex justify-content-between align-items-start">
      <h5 className="text-light mb-2">{item.title || item.name}</h5>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => borrarDelHistorial(item.id)}
      >
        ✖
      </button>
    </div>
    <p className="text-muted">{item.overview?.slice(0, 150)}...</p>

    {tipo === 'movie' ? (
      <Link to={`/pelicula/${item.id}`} className="btn btn-sm btn-outline-light">
        Ver detalles
      </Link>
    ) : (
      <div className="mt-2">
        <SeguimientoSerie tmdbId={item.id} />
      </div>
    )}
  </div>
</div>

          ))}
        </div>
      )}
    </div>
  );
};

export default Historial;
