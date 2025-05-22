import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetalleItem from "../components/DetalleItem";
import ValoracionUsuario from "../components/ValoracionUsuario";
import ValoracionesBloque from "../components/ValoracionesBloque";
import ModalSeguimiento from "../components/ModalSeguimiento";
import TextoColapsado from "../components/TextoColapsado";
import Comentarios from "../components/Comentarios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaRegCommentDots } from "react-icons/fa";
import {
  BsListUl,
  BsFolderPlus,
  BsPlusLg,
  BsCalendar,
  BsCardText,
  BsTv,
  BsController,
  BsClock,
  BsBroadcast,
  BsChatDots,
  BsCheckLg,
} from "react-icons/bs";

import { FaHeart, FaRegHeart } from "react-icons/fa";

const SerieDetail = () => {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState("");
  const [listasIncluye, setListasIncluye] = useState([]);
  const [actualizarValoraciones, setActualizarValoraciones] = useState(0);
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(
    sessionStorage.getItem("seguirAbierto") === "true"
  );
  const [progreso, setProgreso] = useState(null);
  const [plataformas, setPlataformas] = useState({ items: [], link: null });
  const [nuevaLista, setNuevaLista] = useState("");
  const [modoCrearLista, setModoCrearLista] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    sessionStorage.setItem("seguirAbierto", mostrarSeguimiento);
  }, [mostrarSeguimiento]);

  useEffect(() => {
    const fetchSerie = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&language=es-ES`
      );
      let data = await res.json();

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

      // 🔽 Añadido aquí
      try {
        const resProv = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=${
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

      if (token) {
        const favoritosRes = await fetch(
          `${import.meta.env.VITE_API_URL}/favoritos`,
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
          `${import.meta.env.VITE_API_URL}/listas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const listasData = await listasRes.json();
        setListas(listasData);
      }
    };

    fetchSerie();
  }, [id, token]);

  useEffect(() => {
    if (token && serie?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/listas/incluye/tv/${serie.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setListasIncluye(data))
        .catch((err) => console.error("Error al cargar listas:", err));

      fetch(`${import.meta.env.VITE_API_URL}/seguimiento/tv/${serie.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (serie?.number_of_episodes) {
            const vistos = data.length;
            const total = serie.number_of_episodes;
            setProgreso(`${vistos}/${total} vistos`);
          }
        })
        .catch((err) => console.error("Error al cargar progreso:", err));
    }
  }, [serie?.id, token, serie?.number_of_episodes]);

  const toggleFavorito = async () => {
    if (!token || !serie) return;

    const url = `${import.meta.env.VITE_API_URL}/favoritos${
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
    <motion.div
      className="container text-light py-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="row g-4 align-items-start flex-column flex-md-row">
        <div className="col-md-4 text-center text-md-start">
          <motion.img
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200 }}
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

          {token && (
            <>
              <ValoracionUsuario
                tmdb_id={serie.id}
                tipo="tv"
                onValoracionGuardada={() =>
                  setActualizarValoraciones((prev) => prev + 1)
                }
              />

              {mostrarSeguimiento && (
                <ModalSeguimiento
                  tmdbId={serie.id}
                  onClose={() => setMostrarSeguimiento(false)}
                />
              )}
            </>
          )}
        </div>

        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap sin-fondo">
            <h2 className="text-primary fw-bold me-2">{serie.name}</h2>
            <motion.button
              onClick={toggleFavorito}
              className="btn border-0 p-0"
              title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.span
                animate={{ rotate: esFavorito ? 360 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: "2rem",
                  color: esFavorito ? "red" : "#6c757d",
                }}
              >
                {esFavorito ? <FaHeart /> : <FaRegHeart />}
              </motion.span>
            </motion.button>
          </div>

          <div className="mb-3 d-flex flex-column align-items-start sin-fondo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setMostrarSeguimiento(true)}
              className="btn-seguimiento d-flex align-items-center gap-2"
            >
              <BsTv />
              Mostrar seguimiento
            </motion.button>

            {progreso && (
              <div className="barra-seguimiento mt-2">
                <div
                  className="barra-seguimiento-interna"
                  style={{
                    width: `${
                      (parseInt(progreso.split("/")[0]) /
                        parseInt(progreso.split("/")[1])) *
                      100
                    }%`,
                  }}
                />
              </div>
            )}
          </div>

          <br></br>
          {token && (
            <div className="mb-4">
              <label className="form-label">
                <BsListUl className="me-1" />
                Añadir a lista:
              </label>

              <div className="d-flex gap-2 flex-wrap align-items-center">
                {!modoCrearLista ? (
                  <>
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
                      className="btn btn-outline-secondary btn-sm btn-igual me-2"
                      onClick={() => {
                        setModoCrearLista(true);
                        setListaSeleccionada("");
                      }}
                    >
                      <BsFolderPlus className="me-1" />
                      Nueva lista
                    </button>

                    <button
                      className="btn btn-primary btn-sm btn-igual"
                      disabled={!listaSeleccionada}
                      onClick={async () => {
                        const payload = {
                          pelicula_id: serie.id,
                          tipo: "tv",
                        };
                        try {
                          const res = await fetch(
                            `${
                              import.meta.env.VITE_API_URL
                            }/listas/${listaSeleccionada}/contenido`,
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
                            alert(respuesta.mensaje || "Error al añadir");
                          }
                        } catch {
                          alert("Error al conectar con el servidor");
                        }
                      }}
                    >
                      <BsPlusLg className="me-1" />
                      Añadir
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre de la nueva lista"
                      value={nuevaLista}
                      onChange={(e) => setNuevaLista(e.target.value)}
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={async () => {
                        if (!nuevaLista.trim()) {
                          alert("Escribe un nombre válido");
                          return;
                        }

                        try {
                          // 1. Crear lista
                          const res = await fetch(
                            `${import.meta.env.VITE_API_URL}/listas`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ nombre: nuevaLista }),
                            }
                          );

                          const data = await res.json();
                          if (res.ok && data?.id != null) {
                            setListas((prev) => [...prev, data]);
                            setListaSeleccionada(data.id.toString());
                            setModoCrearLista(false);
                            setNuevaLista("");

                            // 2. Añadir la serie a la lista nueva
                            const addRes = await fetch(
                              `${import.meta.env.VITE_API_URL}/listas/${
                                data.id
                              }/contenido`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  pelicula_id: serie.id,
                                  tipo: "tv",
                                }),
                              }
                            );

                            if (addRes.ok) {
                              alert("✅ Lista creada y serie añadida");
                            } else {
                              alert(
                                "Lista creada pero no se pudo añadir la serie"
                              );
                            }
                          } else {
                            alert(data.mensaje || "No se pudo crear la lista");
                          }
                        } catch (error) {
                          console.error(
                            "❌ Error al crear lista y añadir contenido:",
                            error
                          );
                          alert("Error al conectar con el servidor");
                        }
                      }}
                    >
                      Crear
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        setModoCrearLista(false);
                        setNuevaLista("");
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>

              {listasIncluye.length > 0 && (
                <div className="mt-2 text-light small">
                  <span className="me-1">✅ </span>
                  <span className="me-1 text-success">
                    <BsCheckLg />
                  </span>
                  <span className="fw-semibold">Ya en:</span>

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

          <br />
          <DetalleItem
            icono={<BsCalendar />}
            etiqueta="Primera emisión:"
            valor={serie.first_air_date}
          />
          <DetalleItem
            icono={<BsCardText />}
            etiqueta="Resumen:"
            valor={
              <TextoColapsado texto={serie.overview || "No disponible."} />
            }
          />
          <DetalleItem
            icono={<BsTv />}
            etiqueta="Temporadas:"
            valor={serie.number_of_seasons}
          />
          <DetalleItem
            icono={<BsController />}
            etiqueta="Episodios:"
            valor={serie.number_of_episodes}
          />
          <DetalleItem
            icono={<BsClock />}
            etiqueta="Duración por episodio:"
            valor={`${serie.episode_run_time?.[0] || "—"} min`}
          />

          {plataformas.items.length > 0 ? (
            <DetalleItem
              icono={<BsBroadcast />}
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
              icono={<BsBroadcast />}
              etiqueta="Disponible en:"
              valor="No disponible en plataformas en España"
            />
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="btn-comentarios mt-3"
            data-bs-toggle="modal"
            data-bs-target="#modalComentarios"
          >
            <FaRegCommentDots className="me-2" />
            Ver comentarios
          </motion.button>
          <Comentarios tmdbId={serie.id} tipo={"tv"} />

          <br />
        </div>
      </div>
    </motion.div>
  );
};

export default SerieDetail;
