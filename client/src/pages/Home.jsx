import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cartelera from "../components/Cartelera";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [peliculas, setPeliculas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [generos, setGeneros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState("");
  const [tipo, setTipo] = useState("movie");
  const [modoBusqueda, setModoBusqueda] = useState("titulo");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [orden, setOrden] = useState("popularity.desc");
  const [buscando, setBuscando] = useState(false);
  const [restaurando, setRestaurando] = useState(true);
  const [estadoRestaurado, setEstadoRestaurado] = useState(false);
  const totalPaginasRef = useRef(1);
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const savedState = sessionStorage.getItem("cineStashState");
    if (savedState) {
      const {
        busqueda,
        generoSeleccionado,
        tipo,
        modoBusqueda,
        pagina,
        orden,
        buscando,
        peliculas,
        totalPaginas,
      } = JSON.parse(savedState);

      setBusqueda(busqueda);
      setGeneroSeleccionado(generoSeleccionado);
      setTipo(tipo);
      setModoBusqueda(modoBusqueda);
      setPagina(pagina);
      setOrden(orden);
      setBuscando(buscando);
      setPeliculas(Array.isArray(peliculas) ? peliculas : []);
      setTotalPaginas(totalPaginas || 1);
    } else {
      setBuscando(false);
    }

    setEstadoRestaurado(true);
    setRestaurando(false);
  }, []);

  useEffect(() => {
    if (!estadoRestaurado) return; // 💥 solo guardar si ya se restauró

    const state = {
      busqueda,
      generoSeleccionado,
      tipo,
      modoBusqueda,
      pagina,
      orden,
      buscando,
      peliculas,
      totalPaginas,
    };
    sessionStorage.setItem("cineStashState", JSON.stringify(state));
  }, [
    busqueda,
    generoSeleccionado,
    tipo,
    modoBusqueda,
    pagina,
    orden,
    buscando,
    peliculas,
    totalPaginas,
    estadoRestaurado,
  ]);

  const fetchPopulares = useCallback(
    async (paginaArgumento) => {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const pageParam =
        Number.isInteger(paginaArgumento) && paginaArgumento > 0
          ? paginaArgumento
          : Number.isInteger(pagina) && pagina > 0
          ? pagina
          : 1; // fallback seguro

      if (!API_KEY || !tipo || !pageParam) {
        console.warn("Petición inválida:", { API_KEY, tipo, pageParam });
        return;
      }

      try {
        const url = `https://api.themoviedb.org/3/${tipo}/popular?api_key=${API_KEY}&language=es-ES&page=${pageParam}&include_adult=false&region=ES`;
        console.log("Cargando populares:", url);
        const res = await fetch(url);
        const data = await res.json();
        setPeliculas(Array.isArray(data.results) ? data.results : []);
        setTotalPaginas(data.total_pages || 1);
        totalPaginasRef.current = data.total_pages || 1;
      } catch (error) {
        console.error("Error al cargar contenido popular:", error);
      }
    },
    [tipo, pagina]
  );

  const buscarPeliculas = useCallback(
    async (paginaArgumento) => {
      const pageParam =
        Number.isInteger(paginaArgumento) && paginaArgumento > 0
          ? paginaArgumento
          : pagina;

      if (!Number.isInteger(pageParam) || pageParam < 1) {
        console.warn("Petición inválida en búsqueda:", { pageParam });
        return;
      }

      try {
        if (!busqueda.trim()) {
          const url = `https://api.themoviedb.org/3/discover/${tipo}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES&page=${pageParam}&sort_by=${orden}${
            generoSeleccionado ? `&with_genres=${generoSeleccionado}` : ""
          }`;

          try {
            const res = await fetch(url);
            const data = await res.json();
            setPeliculas(Array.isArray(data.results) ? data.results : []);
            setTotalPaginas(data.total_pages || 1);
            totalPaginasRef.current = data.total_pages || 1;
          } catch (error) {
            console.error("Error en discover sin texto:", error);
            setPeliculas([]);
            setTotalPaginas(1);
          }

          return;
        }

        if (modoBusqueda === "titulo") {
          let url = `https://api.themoviedb.org/3/search/${tipo}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&query=${encodeURIComponent(
            busqueda
          )}&language=es-ES&page=${pageParam}`;

          if (generoSeleccionado) {
            url += `&with_genres=${generoSeleccionado}`;
          }

          const res = await fetch(url);
          const data = await res.json();
          setPeliculas(Array.isArray(data.results) ? data.results : []);
          setTotalPaginas(data.total_pages || 1);
          totalPaginasRef.current = data.total_pages || 1; // ← AÑADE ESTO AQUÍ TAMBIÉN
        }
      } catch (error) {
        console.error("Error en la búsqueda:", error);
        setPeliculas([]);
        setTotalPaginas(1);
      }
    },
    [tipo, pagina, busqueda, generoSeleccionado, modoBusqueda, orden]
  );

  useEffect(() => {
    if (restaurando) return;

    if (buscando) {
      buscarPeliculas(pagina);
    } else {
      fetchPopulares(pagina);
    }
  }, [pagina, buscando, buscarPeliculas, fetchPopulares, restaurando]);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/genre/${tipo}/list?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES`
    )
      .then((res) => res.json())
      .then((data) => setGeneros(data.genres));
  }, [tipo]);

  const reiniciarFiltros = () => {
    setBusqueda("");
    setGeneroSeleccionado("");
    setTipo("movie");
    setModoBusqueda("titulo");
    setPagina(1);
    sessionStorage.removeItem("cineStashState");
    fetchPopulares(1); // ✅ fuerza página 1

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!estadoRestaurado) return; // Evita guardar antes de restaurar

    const currentState = {
      busqueda,
      generoSeleccionado,
      tipo,
      modoBusqueda,
      pagina,
      orden,
      buscando,
      peliculas,
      totalPaginas,
    };

    const savedState = sessionStorage.getItem("cineStashState");
    const parsedSaved = savedState ? JSON.parse(savedState) : null;

    // Solo guarda si hay cambios reales
    if (JSON.stringify(parsedSaved) !== JSON.stringify(currentState)) {
      sessionStorage.setItem("cineStashState", JSON.stringify(currentState));
    }
  }, [
    busqueda,
    generoSeleccionado,
    tipo,
    modoBusqueda,
    pagina,
    orden,
    buscando,
    peliculas,
    totalPaginas,
    estadoRestaurado,
  ]);

  useEffect(() => {
    if (!estadoRestaurado || !buscando) return;

    buscarPeliculas(1);
  }, [
    generoSeleccionado,
    orden,
    tipo,
    modoBusqueda,
    buscarPeliculas,
    buscando,
    estadoRestaurado,
  ]);

  const mostrarCartelera =
    !buscando &&
    tipo === "movie" &&
    !busqueda &&
    !generoSeleccionado &&
    pagina === 1;

  if (!estadoRestaurado) {
    return <p className="text-light">Restaurando estado...</p>;
  }

  return (
    <motion.div
      className="container mt-4 text-light"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {mostrarCartelera && (
        <div className="mb-5">
          <Cartelera />
          <hr className="my-5 text-secondary" />
        </div>
      )}
      <h2 className="mb-2 text-primary">
        Explora {tipo === "movie" ? "Películas" : "Series"}
      </h2>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={
            modoBusqueda === "actor"
              ? `Buscar ${
                  tipo === "movie" ? "películas" : "series"
                } por actor/actriz...`
              : modoBusqueda === "director"
              ? `Buscar ${
                  tipo === "movie" ? "películas" : "series"
                } por director/a...`
              : `Buscar ${
                  tipo === "movie" ? "películas" : "series"
                } por título...`
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            setPagina(1); // reinicia a página 1
            setBuscando(true); // activa modo búsqueda
          }}
        >
          Buscar
        </button>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap align-items-center">
        <select
          className="form-select w-auto"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setPagina(1);
          }}
        >
          <option value="movie">Películas</option>
          <option value="tv">Series</option>
        </select>

        <select
          className="form-select w-auto"
          value={generoSeleccionado}
          onChange={(e) => {
            setGeneroSeleccionado(e.target.value);
            setPagina(1);
            setBuscando(true); // ✅ fuerza la búsqueda al instante
          }}
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="form-select w-auto"
          value={modoBusqueda}
          onChange={(e) => {
            setModoBusqueda(e.target.value);
            setPagina(1);
          }}
        >
          <option value="titulo">Por título</option>
          <option value="actor">Por actor/actriz</option>
          <option value="director">Por director/a</option>
        </select>

        {busqueda.trim() === "" && (
          <select
            className="form-select w-auto"
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value);
              setPagina(1);
              setBuscando(true);
            }}
          >
            <option value="popularity.desc">Más populares</option>
            <option value="popularity.asc">Menos populares</option>
            <option value="release_date.desc">Más recientes</option>
            <option value="release_date.asc">Más antiguas</option>
            <option value="vote_average.desc">Mejor valoradas</option>
            <option value="vote_average.asc">Peor valoradas</option>
          </select>
        )}

        <button
          className="btn btn-light border btn-sm shadow-sm"
          onClick={reiniciarFiltros}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Reiniciar filtros
        </button>
      </div>

      {!peliculas || peliculas.length === 0 ? (
        <p className="text-light">Cargando contenido popular...</p>
      ) : (
        <div className="row">
          {peliculas.length > 0 && (
            <div className="d-flex justify-content-center my-4 flex-wrap gap-2">
              {/* Primera página */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="boton-paginacion"
                disabled={!Number.isInteger(totalPaginas) || pagina === 1}
                onClick={() => {
                  if (pagina !== 1) setPagina(1);
                  else {
                    if (buscando) buscarPeliculas(1);
                    else fetchPopulares(1);
                  }
                }}
                title="Primera página"
              >
                ⏮
              </motion.button>

              {/* Anterior */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="boton-paginacion"
                disabled={!Number.isInteger(totalPaginas) || pagina === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                title="Anterior"
              >
                ◀
              </motion.button>

              {/* Números de página */}
              {[
                ...new Set(
                  Array.from({ length: 5 }, (_, i) => pagina - 2 + i).filter(
                    (p) => p >= 1 && p <= totalPaginas
                  )
                ),
              ].map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => setPagina(page)}
                  className={`boton-paginacion ${
                    page === pagina ? "bg-primary text-white fw-bold" : ""
                  }`}
                >
                  {page}
                </motion.button>
              ))}

              {/* Siguiente */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="boton-paginacion"
                disabled={
                  !Number.isInteger(totalPaginas) || pagina === totalPaginas
                }
                onClick={() => setPagina((p) => p + 1)}
                title="Siguiente"
              >
                ▶
              </motion.button>

              {/* Última página */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="boton-paginacion"
                disabled={
                  !Number.isInteger(totalPaginas) || pagina === totalPaginas
                }
                onClick={() => {
                  const siguienteSalto = Math.min(pagina + 10, totalPaginas);
                  setPagina(siguienteSalto);
                  if (buscando) buscarPeliculas(siguienteSalto);
                  else fetchPopulares(siguienteSalto);
                }}
                title="Última página"
              >
                ⏭
              </motion.button>
            </div>
          )}

          {Array.isArray(peliculas) &&
            peliculas.map((peli, index) => (
              <motion.div
                key={peli.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="col-6 col-sm-4 col-md-3 col-lg-5th mb-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 250 }}
                  className="card bg-dark text-white border-0 shadow-sm h-100"
                  onClick={(e) => {
                    const img = e.currentTarget.querySelector(".poster-img");
                    img.classList.add("flipping");
                    setTimeout(() => {
                      navigate(
                        `/${tipo === "movie" ? "pelicula" : "serie"}/${peli.id}`
                      );
                    }, 400);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${peli.poster_path}`}
                    className="card-img-top poster-img"
                    alt={peli.title || peli.name}
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div className="card-body px-2 py-2">
                    <h6 className="card-title mb-1">
                      {peli.title || peli.name}
                    </h6>
                  </div>
                </motion.div>
              </motion.div>
            ))}

          {peliculas.length > 0 && (
            <div className="d-flex justify-content-center my-4 flex-wrap gap-2">
              {/* Primera página */}
              <button
                className="boton-paginacion"
                disabled={!Number.isInteger(totalPaginas) || pagina === 1}
                onClick={() => {
                  if (pagina !== 1) setPagina(1);
                  else {
                    if (buscando) buscarPeliculas(1);
                    else fetchPopulares(1);
                  }
                }}
                title="Primera página"
              >
                ⏮
              </button>

              {/* Anterior */}
              <button
                className="boton-paginacion"
                disabled={!Number.isInteger(totalPaginas) || pagina === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                title="Anterior"
              >
                ◀
              </button>

              {/* Números de página */}
              {[
                ...new Set(
                  Array.from({ length: 5 }, (_, i) => pagina - 2 + i).filter(
                    (p) => p >= 1 && p <= totalPaginas
                  )
                ),
              ].map((page) => (
                <button
                  key={page}
                  onClick={() => setPagina(page)}
                  className={`btn btn-sm ${
                    page === pagina
                      ? "btn-primary text-white fw-bold"
                      : "btn-light border"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Siguiente */}
              <button
                className="boton-paginacion"
                disabled={
                  !Number.isInteger(totalPaginas) || pagina === totalPaginas
                }
                onClick={() => setPagina((p) => p + 1)}
                title="Siguiente"
              >
                ▶
              </button>

              {/* Última página */}
              <button
                className="boton-paginacion"
                disabled={
                  !Number.isInteger(totalPaginas) || pagina === totalPaginas
                }
                onClick={() => {
                  const siguienteSalto = Math.min(pagina + 10, totalPaginas);
                  setPagina(siguienteSalto);
                  if (buscando) buscarPeliculas(siguienteSalto);
                  else fetchPopulares(siguienteSalto);
                }}
                title="Última página"
              >
                ⏭
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Home;
