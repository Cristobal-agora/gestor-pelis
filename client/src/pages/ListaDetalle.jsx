import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaTrashAlt,
  FaFilm,
  FaVideo,
  FaTv,
  FaFolderOpen,
} from "react-icons/fa";

const ListaDetalle = ({ modoClaro }) => {
  const { id } = useParams();
  const token = sessionStorage.getItem("token");
  const [elementos, setElementos] = useState([]);
  const [nombreLista, setNombreLista] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("movie");

  useEffect(() => {
    const obtenerNombreLista = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/listas/${id}/detalle`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al obtener nombre de la lista");

        const data = await res.json();
        setNombreLista(data.nombre);
      } catch (err) {
        console.error("Error al cargar el nombre de la lista:", err);
        setNombreLista(`Lista ${id}`);
      }
    };

    const cargarContenido = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/listas/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al obtener contenido de la lista");

        const contenido = await res.json();

        const filtrados =
          filtroTipo === "todos"
            ? contenido
            : contenido.filter((f) => f.tipo === filtroTipo);

        const detalles = await Promise.all(
          filtrados.map((item) =>
            fetch(
              `https://api.themoviedb.org/3/${item.tipo}/${
                item.pelicula_id
              }?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`
            )
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => (data ? { ...data, tipo: item.tipo } : null))
              .catch(() => null)
          )
        );

        setElementos(detalles.filter((e) => e));
      } catch (err) {
        console.error("Error al cargar la lista:", err);
      }
    };

    obtenerNombreLista();
    cargarContenido();
  }, [id, token, filtroTipo]);

  const eliminarElemento = async (peliculaId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/listas/${id}/contenido/${peliculaId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setElementos((prev) => prev.filter((e) => e.id !== peliculaId));
      } else {
        console.error("Error al eliminar elemento de la lista");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Filtrar resultados por tipo
  const elementosFiltrados =
    filtroTipo === "todos"
      ? elementos
      : elementos.filter((e) => e.tipo === filtroTipo);

  return (
    <div className={`container mt-4 ${modoClaro ? "text-dark" : "text-light"}`}>
      <h2 className="text-primary mb-3 d-flex align-items-center gap-2">
        <FaFolderOpen /> Lista: {nombreLista}
      </h2>

      <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
        <label className="form-label mb-0 me-2">Tipo:</label>
        <div className="btn-group" role="group">
          <button
            className={`btn btn-filtro-tipo
 d-flex align-items-center gap-2 ${filtroTipo === "todos" ? "active" : ""}`}
            onClick={() => setFiltroTipo("todos")}
          >
            <FaFilm /> Todos
          </button>
          <button
            className={`btn btn-filtro-tipo
 d-flex align-items-center gap-2 ${filtroTipo === "movie" ? "active" : ""}`}
            onClick={() => setFiltroTipo("movie")}
          >
            <FaVideo /> Películas
          </button>
          <button
            className={`btn btn-filtro-tipo
 d-flex align-items-center gap-2 ${filtroTipo === "tv" ? "active" : ""}`}
            onClick={() => setFiltroTipo("tv")}
          >
            <FaTv /> Series
          </button>
        </div>
      </div>

      {elementosFiltrados.length === 0 ? (
        <p
          className={`fw-semibold text-center ${
            modoClaro ? "text-dark" : "text-light"
          }`}
        >
          No hay elementos en esta lista.
        </p>
      ) : (
        <div className="row">
          {elementosFiltrados.map((item) => (
            <div
              key={item.id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4"
            >
              <Link
                to={`/${item.tipo === "movie" ? "pelicula" : "serie"}/${
                  item.id
                }`}
                className="text-decoration-none"
              >
                <div
                  className={`card border-0 shadow-sm h-100 ${
                    modoClaro ? "bg-light text-dark" : "bg-dark text-white"
                  }`}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    className="card-img-top"
                    alt={item.title || item.name}
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div className="card-body px-2 py-2">
                    <h6 className="card-title mb-1 d-flex justify-content-between align-items-center">
                      <span className="text-truncate">
                        {item.title || item.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          eliminarElemento(item.id);
                        }}
                        className="btn btn-link text-danger ms-2 p-0"
                        title="Eliminar de la lista"
                        style={{ fontSize: "1.5rem", lineHeight: "1" }}
                      >
                        <FaTrashAlt className="icono-borrar-lista" />
                      </button>
                    </h6>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaDetalle;
