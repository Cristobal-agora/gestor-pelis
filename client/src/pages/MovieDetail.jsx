import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetalleItem from "../components/DetalleItem";
import ValoracionUsuario from "../components/ValoracionUsuario";
import ValoracionesBloque from "../components/ValoracionesBloque";
import TextoColapsado from "../components/TextoColapsado";
import Comentarios from "../components/Comentarios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaRegCommentDots } from "react-icons/fa";
import {
  BsEye,
  BsEyeSlash,
  BsListUl,
  BsFolderPlus,
  BsPlusLg,
  BsCalendar,
  BsCardText,
  BsClock,
  BsBroadcast,
  BsCheckLg,
  BsCollectionPlay,
} from "react-icons/bs";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

const MovieDetail = () => {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState("");
  const [listasIncluye, setListasIncluye] = useState([]);
  const yaIncluida = listasIncluye.some(
    (l) => l.id.toString() === listaSeleccionada
  );

  const [actualizarValoraciones, setActualizarValoraciones] = useState(0);
  const [plataformas, setPlataformas] = useState({ items: [], link: null });
  const [vista, setVista] = useState(false);
  const [nuevaLista, setNuevaLista] = useState("");
  const [modoCrearLista, setModoCrearLista] = useState(false);

  const token = sessionStorage.getItem("token");

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
      fetch(`${import.meta.env.VITE_API_URL}/favoritos`, {
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

      fetch(`${import.meta.env.VITE_API_URL}/listas`, {
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
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const encontrada = data.find(
            (v) => v.tmdb_id === parseInt(id) && v.tipo === "movie"
          );
          setVista(!!encontrada);
        })
        .catch((err) => {
          console.error("Error al cargar historial:", err);
        });
    }
  }, [id, token]);

  useEffect(() => {
    if (token && pelicula?.id) {
      fetch(
        `${import.meta.env.VITE_API_URL}/listas/incluye/movie/${pelicula.id}`,
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
      toast.info("Debes iniciar sesión para guardar favoritos");

      return;
    }

    try {
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

  const toggleVista = async () => {
    if (!token)
      return toast.info("Debes iniciar sesión para usar esta función");

    const url = `${import.meta.env.VITE_API_URL}/historial${
      vista ? `/${id}/movie` : ""
    }`;
    const metodo = vista ? "DELETE" : "POST";
    const body = vista ? null : JSON.stringify({ tmdb_id: id, tipo: "movie" });

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (res.ok) {
        setVista(!vista);
      } else {
        console.error("Error al cambiar estado de visualización");
      }
    } catch (err) {
      console.error("Error en toggleVista:", err);
    }
  };
  const anadirAPeliculaAListaSeleccionada = async () => {
    if (!token) {
      return toast.info("Debes iniciar sesión");
    }

    if (!listaSeleccionada) {
      return toast.warn("Selecciona una lista válida");
    }

    if (yaIncluida) {
      return toast.info("Esta película ya está en esa lista");
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/listas/${listaSeleccionada}/contenido`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pelicula_id: pelicula.id,
            tipo: "movie",
          }),
        }
      );

      if (res.ok) {
        toast.success("Película añadida a la lista correctamente");

        const listaAñadida = listas.find(
          (l) => l.id.toString() === listaSeleccionada
        );
        if (listaAñadida) {
          setListasIncluye((prev) => [...prev, listaAñadida]);
        }
      } else {
        toast.error("Error al añadir la película a la lista");
      }
    } catch (err) {
      console.error("Error al añadir:", err);
      toast.error("Error de conexión");
    }
  };

  if (!pelicula) return <div className="text-light">Cargando...</div>;

  return (
    <motion.div
      className="container text-light py-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="row g-4 align-items-start flex-column flex-md-row">
        <div className="col-md-4 text-center text-md-start">
          <motion.img
            src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`}
            alt={pelicula?.title || pelicula?.name}
            className="img-fluid rounded shadow detalle-poster"
            style={{
              maxHeight: "600px",
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0px 8px 20px rgba(255, 255, 255, 0.2)",
            }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>

        <div className="col-md-8">
          <div className="sin-fondo mb-3">
            <div className="movie-title-wrapper d-flex justify-content-between align-items-center flex-wrap">
              <h2 className="text-azul-suave fw-bold me-2 mb-3 sin-fondo">
                {pelicula.title}
              </h2>

              <div className="d-flex align-items-center gap-3">
                <motion.button
                  onClick={toggleFavorito}
                  className="btn border-0 p-0 d-flex align-items-center justify-content-center"
                  title={
                    esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"
                  }
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    width: "48px",
                    height: "48px", // Igual altura que btn-visto
                    borderRadius: "999px", // Redondeado
                    backgroundColor: "transparent", // o color dinámico si quieres
                  }}
                >
                  <motion.span
                    animate={{ rotate: esFavorito ? 360 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      fontSize: "1.6rem",
                      color: esFavorito ? "red" : "#6c757d",
                      lineHeight: "1",
                    }}
                  >
                    {esFavorito ? <FaHeart /> : <FaRegHeart />}
                  </motion.span>
                </motion.button>

                {token && (
                  <motion.button
                    onClick={toggleVista}
                    className={`btn-visto ${vista ? "visto" : "no-visto"}`}
                    title={vista ? "Marcar como no vista" : "Marcar como vista"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.span
                      initial={false}
                      animate={{ rotate: vista ? 360 : 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "1.4rem",
                        lineHeight: 1,
                        filter: vista
                          ? "drop-shadow(0 0 4px limegreen)"
                          : "drop-shadow(0 0 3px crimson)",
                      }}
                    >
                      {vista ? <BsEye /> : <BsEyeSlash />}
                    </motion.span>
                    {vista ? "Vista" : "No vista"}
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {token && (
            <div className="mb-4">
              <label className="form-label">
                <BsListUl className="me-1" /> Añadir a lista:
              </label>

              <div className="d-flex gap-2 flex-wrap align-items-center">
                {!modoCrearLista ? (
                  <>
                    <select
                      className="select-uniforme"
                      value={listaSeleccionada}
                      onChange={(e) => setListaSeleccionada(e.target.value)}
                      aria-label="Selecciona una lista"
                    >
                      <option value="" disabled hidden>
                        Selecciona una lista
                      </option>
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
                      className="btn-anadir ms-1"
                      onClick={anadirAPeliculaAListaSeleccionada}
                      disabled={!listaSeleccionada || yaIncluida}
                      title={
                        !listaSeleccionada
                          ? "Selecciona una lista"
                          : yaIncluida
                          ? "Ya está en esta lista"
                          : "Añadir a lista"
                      }
                    >
                      <BsPlusLg />
                      Añadir a lista
                    </button>

                    <button
                      className="btn-nueva-lista"
                      onClick={() => {
                        setModoCrearLista(true);
                        setListaSeleccionada(""); // opcional: reset selección
                      }}
                    >
                      <BsFolderPlus className="me-1" /> Nueva lista
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
                      className="btn-crear-lista"
                      onClick={async () => {
                        if (!nuevaLista.trim()) {
                          return toast.warn("Escribe un nombre válido");
                        }

                        try {
                          // 1. Crear la lista
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
                            // 2. Añadir la película a la nueva lista
                            const resContenido = await fetch(
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
                                  pelicula_id: pelicula.id,
                                  tipo: "movie",
                                }),
                              }
                            );

                            if (resContenido.ok) {
                              toast.success(
                                "Lista creada y película añadida correctamente"
                              );
                              setListas((prev) => [...prev, data]);
                              setListasIncluye((prev) => [...prev, data]); // 🔧 asegura que yaIncluida sea true
                              setListaSeleccionada(data.id.toString());
                              setModoCrearLista(false);
                              setNuevaLista("");
                            } else {
                              toast.warn(
                                "Lista creada, pero no se pudo añadir la película."
                              );
                            }
                          } else {
                            toast.error(
                              data.mensaje || "No se pudo crear la lista"
                            );
                          }
                        } catch (err) {
                          console.error("❌ Error:", err);
                          toast.error("Error de conexión");
                        }
                      }}
                    >
                      Crear
                    </button>
                    <button
                      className="btn-cancelar-lista"
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
                  <span className="me-1 text-success">
                    <BsCheckLg />
                  </span>
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

          <div className="row mt-3 align-items-start">
            <div className="col-md-8">
              <DetalleItem
                icono={<BsCalendar />}
                etiqueta="Fecha de estreno:"
                valor={pelicula.release_date}
              />

              <DetalleItem
                icono={<BsCardText />}
                etiqueta="Resumen:"
                valor={
                  <TextoColapsado
                    texto={pelicula.overview || "No disponible."}
                  />
                }
              />

              <DetalleItem
                icono={<BsCollectionPlay />}
                etiqueta="Género:"
                valor={pelicula.genres.map((g) => g.name).join(", ")}
              />

              <DetalleItem
                icono={<BsClock />}
                etiqueta="Duración:"
                valor={`${pelicula.runtime} min`}
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
                      className="d-flex flex-row flex-md-wrap gap-2 align-items-center"
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
              <br />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="btn-comentarios d-flex align-items-center gap-2 mt-2"
                data-bs-toggle="modal"
                data-bs-target="#modalComentarios"
              >
                <FaRegCommentDots size={18} />
                Ver comentarios
              </motion.button>
            </div>

            {token && (
              <div className="col-md-4 d-flex justify-content-end mt-4 mt-md-0">
                <div style={{ maxWidth: "280px" }}>
                  <ValoracionUsuario
                    tmdb_id={pelicula.id}
                    tipo="movie"
                    onValoracionGuardada={() =>
                      setActualizarValoraciones((prev) => prev + 1)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Comentarios tmdbId={pelicula.id} tipo={"movie"} />
      </div>
    </motion.div>
  );
};

export default MovieDetail;
