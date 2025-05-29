import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaFilm, FaVideo, FaTv } from "react-icons/fa";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Favoritos = ({ modoClaro }) => {
  const [items, setItems] = useState([]);
  const [tipo, setTipo] = useState("movie");
  const token = sessionStorage.getItem("token");

  const obtenerFavoritos = useCallback(async () => {
    if (!token) return;
    setItems([]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/favoritos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error(
          "Error al obtener favoritos:",
          res.status,
          await res.text()
        );
        return;
      }

      const favoritos = await res.json();

      if (!Array.isArray(favoritos)) {
        console.error("Respuesta inesperada de favoritos:", favoritos);
        return;
      }

      const filtrados =
        tipo === "todos" ? favoritos : favoritos.filter((f) => f.tipo === tipo);

      const detalles = await Promise.all(
        filtrados.map((f) =>
          fetch(
            `https://api.themoviedb.org/3/${f.tipo}/${f.pelicula_id}?api_key=${
              import.meta.env.VITE_TMDB_API_KEY
            }&language=es-ES`
          )
            .then((res) => res.json())
            .catch(() => null)
        )
      );

      setItems(detalles.filter((p) => p));
    } catch (error) {
      console.error("Error inesperado al cargar favoritos:", error);
    }
  }, [token, tipo]);

  useEffect(() => {
    obtenerFavoritos();
  }, [obtenerFavoritos]);

  const eliminarFavorito = async (id) => {
    if (!token) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/favoritos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className={`container mt-4 ${modoClaro ? "text-dark" : "text-light"}`}>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h2 className="text-primary d-flex align-items-center gap-2 m-0">
          <FaHeart style={{ color: "red" }} />
          Mis Favoritos
        </h2>

        {items.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
            onClick={async () => {
              if (
                !window.confirm(
                  "¿Estás seguro de eliminar todos los favoritos?"
                )
              )
                return;

              try {
                const res = await fetch(
                  `${import.meta.env.VITE_API_URL}/favoritos`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (res.ok) {
                  setItems([]);
                } else {
                  toast.error("Error al eliminar favoritos");
                }
              } catch (err) {
                console.error("Error al borrar favoritos:", err);
                toast.error("Error al conectar con el servidor");
              }
            }}
          >
            <FaHeart /> Eliminar todos
          </motion.button>
        )}
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
        <label className="form-label mb-0 me-2">Tipo:</label>
        <div className="btn-group" role="group">
          <button
            className={`btn btn-filtro-tipo
 d-flex align-items-center gap-2 ${tipo === "todos" ? "active" : ""}`}
            onClick={() => setTipo("todos")}
          >
            <FaFilm /> Todos
          </button>
          <button
            className={`btn btn-filtro-tipo
 d-flex align-items-center gap-2 ${tipo === "movie" ? "active" : ""}`}
            onClick={() => setTipo("movie")}
          >
            <FaVideo /> Películas
          </button>
          <button
            className={`btn btn-filtro-tipo
 d-flex align-items-center gap-2 ${tipo === "tv" ? "active" : ""}`}
            onClick={() => setTipo("tv")}
          >
            <FaTv /> Series
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p
          className={`text-center fw-semibold ${
            modoClaro ? "text-dark" : "text-light"
          }`}
        >
          No has agregado favoritos aún.
        </p>
      ) : (
        <div className="row">
          {items.map((item) => (
            <div
              key={item.id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 position-relative"
            >
              <Link
                to={`/${
                  item.media_type === "tv" || item.name ? "serie" : "pelicula"
                }/${item.id}`}
                className="text-decoration-none"
                style={{ zIndex: 1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`card border-0 shadow-sm h-100 ${
                    modoClaro ? "bg-light text-dark" : "bg-dark text-white"
                  }`}
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    className="card-img-top"
                    alt={item.title || item.name}
                    style={{ objectFit: "cover", height: "100%" }}
                  />
                  <div className="card-body px-2 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="card-title mb-0 me-2">
                        {item.title || item.name}
                      </h6>
                      <button
                        className="btn btn-sm p-0 border-0 bg-transparent"
                        title="Quitar de favoritos"
                        onClick={(e) => {
                          e.preventDefault();
                          eliminarFavorito(item.id);
                        }}
                      >
                        <FaHeart className="icono-favorito" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
