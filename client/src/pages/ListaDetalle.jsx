import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ListaDetalle = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [elementos, setElementos] = useState([]);

  useEffect(() => {
    const cargarContenido = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/listas/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al obtener contenido de la lista");

        const contenido = await res.json();
        console.log("Contenido crudo:", contenido);

        const detalles = await Promise.all(
          contenido.map((item) => {
            if (!item.tipo || !item.pelicula_id) return null;

            return fetch(
              `https://api.themoviedb.org/3/${item.tipo}/${
                item.pelicula_id
              }?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`
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

    cargarContenido();
  }, [id, token]);

  const eliminarElemento = async (peliculaId) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/listas/${id}/contenido/${peliculaId}`,
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

  return (
    <div className="container text-light mt-4">
      <h2 className="text-primary mb-4">📂 Contenido de la Lista #{id}</h2>

      {elementos.length === 0 ? (
        <p className="text-muted">No hay elementos en esta lista.</p>
      ) : (
        <div className="row">
          {elementos.map((item) => (
            <div
              key={item.id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 position-relative"
            >
              <button
                onClick={() => eliminarElemento(item.id)}
                className="position-absolute top-0 end-0 m-2 border-0 bg-transparent"
                title="Eliminar de la lista"
                style={{ zIndex: 2, fontSize: "1.2rem", color: "#dc3545" }}
              >
                ✖
              </button>

              <Link
                to={`/${item.title ? "pelicula" : "serie"}/${item.id}`}
                className="text-decoration-none"
                style={{ zIndex: 1 }}
              >
                <div className="card bg-dark text-white border-0 shadow-sm h-100 hover-scale">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    className="card-img-top"
                    alt={item.title || item.name}
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div className="card-body px-2 py-2">
                    <h6 className="card-title mb-1">
                      {item.title || item.name}
                    </h6>
                    <p className="card-text text-muted">
                      ⭐ {item.vote_average}
                    </p>
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