import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetalleItem from "../components/DetalleItem";
import ValoracionUsuario from "../components/ValoracionUsuario";
import ValoracionesBloque from "../components/ValoracionesBloque";

const SerieDetail = () => {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState("");
  const [listasIncluye, setListasIncluye] = useState([]);
  const [actualizarValoraciones, setActualizarValoraciones] = useState(0);


  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSerie = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&language=es-ES`
      );
      let data = await res.json();

      // Comprobar si el resumen está vacío o en inglés
      const isPossiblyEnglish =
        !data.overview ||
        (/^[A-Za-z0-9 .,;:()'"!?-]+$/.test(data.overview) &&
          !/[áéíóúñÁÉÍÓÚÑ]/.test(data.overview));

      if (isPossiblyEnglish) {
        const resEn = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=en-US`
        );
        const dataEn = await resEn.json();
        data.overview = dataEn.overview;
      }

      setSerie(data);

      if (token) {
        const favoritosRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favoritos`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const favoritos = await favoritosRes.json();
        setEsFavorito(
          favoritos.some(
            (f) => f.pelicula_id === parseInt(id) && f.tipo === "tv"
          )
        );

        const listasRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/listas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const listasData = await listasRes.json();
        console.log("📦 Listas obtenidas (TV):", listasData);
        setListas(listasData);
      }
    };

    fetchSerie();
  }, [id, token]);

  useEffect(() => {
    if (token && serie?.id) {
      fetch(
        `${import.meta.env.VITE_API_URL}/api/listas/incluye/tv/${serie.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("📌 Listas que ya incluyen esta serie:", data);
          setListasIncluye(data);
        })
        .catch((err) => {
          console.error("Error al cargar listas que incluyen la serie:", err);
        });
    }
  }, [serie?.id, token]);

  const toggleFavorito = async () => {
    if (!token || !serie) return;

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
            pelicula_id: serie.id,
            titulo: serie.name,
            poster: serie.poster_path,
            tipo: "tv",
          }),
    });

    if (res.ok) setEsFavorito(!esFavorito);
  };

  if (!serie) return <div className="text-light">Cargando serie...</div>;

  return (
    <div className="container text-light py-4">
      <div className="row g-4 align-items-start flex-column flex-md-row">
        <div className="col-md-4 text-center text-md-start">
          <img
            src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
            alt={serie?.title || serie?.name}
            className="img-fluid rounded shadow detalle-poster"
            style={{
              maxHeight: "600px",
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </div>

        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap">
            <h2 className="text-primary fw-bold me-2">{serie.name}</h2>
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
                    if (!serie?.id) {
                      console.error("❌ serie.id está vacío o undefined");
                      return alert(
                        "No se puede añadir: ID de serie no disponible"
                      );
                    }

                    const payload = {
                      pelicula_id: serie.id,
                      tipo: "tv",
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
                        alert("✅ Serie añadida a la lista");
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
  tmdb_id={serie.id}
  tipo="tv"
  tmdb_score={serie.vote_average}
  trigger={actualizarValoraciones}
/>

          <br></br>
          <DetalleItem
            icono="📅"
            etiqueta="Primera emisión:"
            valor={serie.first_air_date}
          />
          <DetalleItem
            icono="📝"
            etiqueta="Resumen:"
            valor={serie.overview || "No disponible."}
          />
          <DetalleItem
            icono="📺"
            etiqueta="Temporadas:"
            valor={serie.number_of_seasons}
          />
          <DetalleItem
            icono="🎞️"
            etiqueta="Episodios:"
            valor={serie.number_of_episodes}
          />
          <DetalleItem
            icono="🎭"
            etiqueta="Género:"
            valor={serie.genres.map((g) => g.name).join(", ")}
          />
          <DetalleItem
            icono="⏱️"
            etiqueta="Duración por episodio:"
            valor={`${serie.episode_run_time?.[0] || "—"} min`}
          />
          <br />

          {token && (
  <ValoracionUsuario
    tmdb_id={serie.id}
    tipo="tv"
    onValoracionGuardada={() => setActualizarValoraciones((prev) => prev + 1)}
  />
)}

        </div>
      </div>
    </div>
  );
};

export default SerieDetail;
