import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetalleItem from "../components/DetalleItem";
import ValoracionUsuario from "../components/ValoracionUsuario";
import ValoracionesBloque from "../components/ValoracionesBloque";
import TextoColapsado from "../components/TextoColapsado";

const MovieDetail = () => {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState("");
  const [listasIncluye, setListasIncluye] = useState([]);
  const [actualizarValoraciones, setActualizarValoraciones] = useState(0);
  const [plataformas, setPlataformas] = useState({ items: [], link: null });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES`
    )
      .then((res) => res.json())
      .then(async (data) => {
        setPelicula(data);

        try {
          const resProv = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${
              import.meta.env.VITE_TMDB_API_KEY
            }`
          );
          const provData = await resProv.json();
          const disponibles = provData.results?.ES?.flatrate || [];
          const link = provData.results?.ES?.link || null;
          setPlataformas({ items: disponibles, link });
        } catch (err) {
          console.error("Error al obtener plataformas:", err);
        }
      });

    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/favoritos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((favoritos) => {
          setEsFavorito(
            favoritos.some(
              (f) => f.pelicula_id === parseInt(id) && f.tipo === "movie"
            )
          );
        });

      fetch(`${import.meta.env.VITE_API_URL}/api/listas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("📦 Listas obtenidas:", data);
          setListas(data);
        });
    }
  }, [id, token]);

  useEffect(() => {
    if (token && pelicula?.id) {
      fetch(
        `${import.meta.env.VITE_API_URL}/api/listas/incluye/movie/${
          pelicula.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("📌 Listas que ya incluyen esta película:", data);
          setListasIncluye(data);
        })
        .catch((err) => {
          console.error(
            "Error al cargar listas que incluyen la película:",
            err
          );
        });
    }
  }, [pelicula?.id, token]);

  const toggleFavorito = async () => {
    if (!token) {
      alert("Debes iniciar sesión para guardar favoritos");
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/favoritos${
        esFavorito ? `/${id}` : ""
      }`;
      const res = await fetch(url, {
        method: esFavorito ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: esFavorito
          ? null
          : JSON.stringify({
              pelicula_id: pelicula.id,
              titulo: pelicula.title,
              poster: pelicula.poster_path,
              tipo: "movie",
            }),
      });

      if (res.ok) setEsFavorito(!esFavorito);
      else console.error("Error al cambiar favorito");
    } catch (error) {
      console.error("Error al guardar favorito:", error);
    }
  };

  if (!pelicula) return <div className="text-light">Cargando...</div>;

  return (
    <div className="container text-light py-4">
      <div className="row g-4 align-items-start flex-column flex-md-row">
        <div className="col-md-4 text-center text-md-start">
          <img
            src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`}
            alt={pelicula?.title || pelicula?.name}
            className="img-fluid rounded shadow detalle-poster"
            style={{
              maxHeight: "600px",
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
          {token && (
            <ValoracionUsuario
              tmdb_id={pelicula.id}
              tipo="movie"
              onValoracionGuardada={() =>
                setActualizarValoraciones((prev) => prev + 1)
              }
            />
          )}
        </div>

        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap">
            <h2 className="text-primary fw-bold me-2">{pelicula.title}</h2>
            <button
              onClick={toggleFavorito}
              className="btn border-0 p-0"
              title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <span
                style={{
                  fontSize: "2rem",
                  color: esFavorito ? "#1f8df5" : "#6c757d",
                  transition: "color 0.3s ease",
                }}
              >
                ★
              </span>
            </button>
          </div>

          {token && (
            <div className="mb-4">
              <label className="form-label">📂 Añadir a lista:</label>

              <div className="d-flex gap-2 flex-wrap">
                <select
                  className="form-select w-auto"
                  value={listaSeleccionada}
                  onChange={(e) => setListaSeleccionada(e.target.value)}
                >
                  <option value="">Selecciona una lista</option>
                  {listas.length === 0 ? (
                    <option disabled>🔸 No tienes listas creadas</option>
                  ) : (
                    listas.map((lista) => (
                      <option key={lista.id} value={lista.id}>
                        {lista.nombre}
                      </option>
                    ))
                  )}
                </select>

                <button
                  onClick={async () => {
                    if (!listaSeleccionada)
                      return alert("Selecciona una lista");

                    if (!pelicula?.id) {
                      console.error("❌ película.id está vacío o undefined");
                      return alert(
                        "No se puede añadir: ID de película no disponible"
                      );
                    }

                    const payload = {
                      pelicula_id: pelicula.id,
                      tipo: "movie",
                    };

                    console.log("📤 Enviando a la API:", payload);

                    try {
                      const res = await fetch(
                        `${
                          import.meta.env.VITE_API_URL
                        }/api/listas/${listaSeleccionada}/contenido`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify(payload),
                        }
                      );

                      const respuesta = await res.json();

                      if (res.ok) {
                        alert("✅ Película añadida a la lista");
                        setListaSeleccionada("");
                      } else {
                        console.error("❌ Error del servidor:", respuesta);
                        alert(
                          `Error al añadir: ${
                            respuesta.mensaje || "error desconocido"
                          }`
                        );
                      }
                    } catch (error) {
                      console.error("❌ Error en la petición:", error);
                      alert("Error al conectar con el servidor");
                    }
                  }}
                  className="btn btn-primary"
                >
                  ➕ Añadir
                </button>
              </div>

              {listasIncluye.length > 0 && (
                <div className="mt-2 text-light small">
                  <span className="me-1">✅ </span>
                  <span className="fw-semibold">Ya en:</span>{" "}
                  {listasIncluye.map((l, i) => (
                    <span key={l.id}>
                      <strong>{l.nombre}</strong>
                      {i < listasIncluye.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <ValoracionesBloque
            tmdb_id={pelicula.id}
            tipo="movie"
            tmdb_score={pelicula.vote_average}
            trigger={actualizarValoraciones}
          />

          <br></br>
          <DetalleItem
            icono="📅"
            etiqueta="Fecha de estreno:"
            valor={pelicula.release_date}
          />
          <DetalleItem
            icono="📝"
            etiqueta="Resumen:"
            valor={
              <TextoColapsado texto={pelicula.overview || "No disponible."} />
            }
          />

          <DetalleItem
            icono="🎭"
            etiqueta="Género:"
            valor={pelicula.genres.map((g) => g.name).join(", ")}
          />
          <DetalleItem
            icono="⏱️"
            etiqueta="Duración:"
            valor={`${pelicula.runtime} min`}
          />

          {plataformas.items.length > 0 ? (
            <DetalleItem
              icono="📡"
              etiqueta="Disponible en:"
              valor={
                <a
                  href={plataformas.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-flex flex-wrap gap-2 align-items-center"
                  style={{ textDecoration: "none" }}
                >
                  {plataformas.items.map((p) => (
                    <img
                      key={p.provider_id}
                      src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                      alt={p.provider_name}
                      title={p.provider_name}
                      className="rounded"
                      style={{
                        backgroundColor: "#fff",
                        padding: "2px",
                        height: "30px",
                      }}
                    />
                  ))}
                </a>
              }
            />
          ) : (
            <DetalleItem
              icono="📡"
              etiqueta="Disponible en:"
              valor="No disponible en plataformas en España"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
