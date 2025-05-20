import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SeguimientoSerie from "../components/SeguimientoSerie";

const Historial = () => {
  const [tipo, setTipo] = useState("todos"); // 'movie' o 'tv'
  const [items, setItems] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        let ids = [];

        if (tipo === "todos") {
          const [pelisRes, seriesRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/historial?tipo=movie`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${import.meta.env.VITE_API_URL}/historial?tipo=tv`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const pelisIds = await pelisRes.json();
          const seriesIds = await seriesRes.json();

          ids = [
            ...pelisIds.map((id) => ({ id, tipo: "movie" })),
            ...seriesIds.map((id) => ({ id, tipo: "tv" })),
          ];
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/historial?tipo=${tipo}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const idsRaw = await res.json();
          ids = idsRaw.map((id) => ({ id, tipo }));
        }

        const detalles = await Promise.all(
          ids.map(({ id, tipo }) =>
            fetch(
              `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${
                import.meta.env.VITE_TMDB_API_KEY
              }&language=es-ES`
            )
              .then((r) => r.json())
              .then((data) => ({ ...data, media_type: tipo }))
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
        <label className="form-label me-2">Tipo:</label>
        <select
          className="form-select w-auto d-inline-block"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="todos">🎞️ Todos</option>
          <option value="movie">🎬 Películas</option>
          <option value="tv">📺 Series</option>
        </select>
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
                  <div>
                    <small className="text-light d-block mb-1">
                      {item.media_type === "movie" ? "🎬 Película" : "📺 Serie"}
                    </small>
                    <h5 className="text-primary mb-2">
                      {item.title || item.name}
                    </h5>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => borrarDelHistorial(item.id)}
                    title="Eliminar del historial"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <p className="text-light">{item.overview?.slice(0, 150)}...</p>

                {item.media_type === "movie" ? (
                  <Link
                    to={`/pelicula/${item.id}`}
                    className="btn btn-sm btn-outline-light"
                  >
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
