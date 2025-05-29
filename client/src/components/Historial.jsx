import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SeguimientoSerie from "../components/SeguimientoSerie";
import { FaTrashAlt, FaFilm, FaVideo, FaTv, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

const Historial = () => {
  const [tipo, setTipo] = useState("todos");
  const [items, setItems] = useState([]);
  const token = sessionStorage.getItem("token");
  const [serieSeleccionada, setSerieSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/historial/${tmdbId}/${tipo}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== tmdbId));
        toast.success("Eliminado del historial");
      } else {
        toast.error("No se pudo eliminar del historial");
      }
    } catch (err) {
      console.error("Error al borrar del historial:", err);
      toast.error("Error al conectar con el servidor");
    }
  };

  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-4 d-flex align-items-center gap-2 text-primary">
        <FaClock /> Historial de Visualización
      </h2>

      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
        <label className="form-label mb-0 me-2">Tipo:</label>
        <div className="btn-group">
          <button
            className={`btn btn-filtro-tipo d-flex align-items-center gap-2 ${
              tipo === "todos" ? "active" : ""
            }`}
            onClick={() => setTipo("todos")}
          >
            <FaFilm /> Todos
          </button>
          <button
            className={`btn btn-filtro-tipo d-flex align-items-center gap-2 ${
              tipo === "movie" ? "active" : ""
            }`}
            onClick={() => setTipo("movie")}
          >
            <FaVideo /> Películas
          </button>
          <button
            className={`btn btn-filtro-tipo d-flex align-items-center gap-2 ${
              tipo === "tv" ? "active" : ""
            }`}
            onClick={() => setTipo("tv")}
          >
            <FaTv /> Series
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-light">No has marcado contenido como visto aún.</p>
      ) : (
        <div className="row g-3">
          {items.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-6 mb-4">
              <div
                className="card bg-dark text-white border border-secondary shadow-sm"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: "220px",
                }}
              >
                <div
                  className="card-body d-flex flex-column"
                  style={{ flexGrow: 1 }}
                >
                  <div>
                    <h5
                      className="mb-2 m-0 d-flex align-items-center gap-2"
                      style={{ color: "#1f8df5" }}
                    >
                      {item.media_type === "movie" ? <FaVideo /> : <FaTv />}
                      {item.title || item.name}
                    </h5>

                    <p className="text-light small mb-2">
                      {item.overview?.slice(0, 150) || "Sin descripción"}...
                    </p>
                  </div>
                  {item.media_type === "movie" ? (
                    <div className="mt-3">
                      <Link
                        to={`/pelicula/${item.id}`}
                        className="btn btn-sm px-2 py-1 text-info bg-transparent border-0"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => {
                          setSerieSeleccionada(item.id);
                          setMostrarModal(true);
                        }}
                      >
                        Temporadas
                      </button>
                    </div>
                  )}
                  <div className="mt-auto d-flex justify-content-end">
                    <button
                      className="btn btn-sm p-0 border-0 bg-transparent text-danger"
                      onClick={() => borrarDelHistorial(item.id)}
                      title="Eliminar del historial"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {mostrarModal && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              tabIndex="-1"
              onClick={() => setMostrarModal(false)}
            >
              <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content bg-dark text-light">
                  <div className="modal-header border-secondary">
                    <h5 className="modal-title">Seguimiento de Temporadas</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setMostrarModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <SeguimientoSerie tmdbId={serieSeleccionada} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Historial;
