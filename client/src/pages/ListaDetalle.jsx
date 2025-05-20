import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ListaDetalle = () => {
  const { id } = useParams();
  const token = sessionStorage.getItem("token");
  const [elementos, setElementos] = useState([]);
  const [nombreLista, setNombreLista] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

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

        const detalles = await Promise.all(
          contenido.map((item) => {
            if (!item.tipo || !item.pelicula_id) return null;

            return fetch(
              `https://api.themoviedb.org/3/${item.tipo}/${item.pelicula_id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`
            )
              .then((res) => (res.ok ? res.json() : null))
              .catch((err) => {
                console.error("Error TMDb:", err);
                return null;
              });
          })
        );

        setElementos(detalles.filter((e) => e));
      } catch (err) {
        console.error("Error al cargar la lista:", err);
      }
    };

    obtenerNombreLista();
    cargarContenido();
  }, [id, token]);

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
      : elementos.filter((e) =>
          filtroTipo === "pelicula" ? e.title : e.name
        );

  return (
    <div className="container text-light mt-4">
      <h2 className="text-primary mb-3">📂 Lista: {nombreLista}</h2>

      <div className="mb-4">
        <select
          className="form-select w-auto"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="todos">🎬 Todos</option>
          <option value="pelicula">🎞️ Solo Películas</option>
          <option value="serie">📺 Solo Series</option>
        </select>
      </div>

      {elementosFiltrados.length === 0 ? (
        <p className="text-light ">No hay elementos en esta lista.</p>
      ) : (
        <div className="row">
          {elementosFiltrados.map((item) => (
            <div
              key={item.id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4"
            >
              <Link
                to={`/${item.title ? "pelicula" : "serie"}/${item.id}`}
                className="text-decoration-none"
              >
                <div className="card bg-dark text-white border-0 shadow-sm h-100 hover-scale">
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
                        <i className="bi bi-trash"></i>
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
