import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cartelera from "../components/Cartelera";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  BsChevronDoubleLeft,
  BsChevronLeft,
  BsChevronRight,
  BsChevronDoubleRight,
} from "react-icons/bs";
import { toast } from "react-toastify";
import { FaVideo, FaTv } from "react-icons/fa";

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
        setTotalPaginas(Math.min(data.total_pages || 1, 500));
        totalPaginasRef.current = Math.min(data.total_pages || 1, 500);
      } catch (error) {
        console.error("Error al cargar contenido popular:", error);
      }
    },
    [tipo, pagina]
  );

  const buscarPeliculas = useCallback(
    async ({
      pagina: paginaArgumento = 1,
      tipoOverride,
      textoOverride,
      generoOverride,
      ordenOverride,
    } = {}) => {
      const texto =
        textoOverride !== undefined ? textoOverride.trim() : busqueda.trim();
      const tipoReal = tipoOverride ?? tipo;
      const generoReal = generoOverride ?? generoSeleccionado;
      const ordenReal = ordenOverride ?? orden;
      const pageParam =
        Number.isInteger(paginaArgumento) && paginaArgumento > 0
          ? paginaArgumento
          : 1;

      try {
        let url;
        let data;

        if (
          (modoBusqueda === "actor" || modoBusqueda === "director") &&
          texto
        ) {
          const url = `https://api.themoviedb.org/3/search/person?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&query=${encodeURIComponent(texto)}&language=es-ES&page=1`;

          const res = await fetch(url);
          const data = await res.json();

          const personas = Array.isArray(data.results) ? data.results : [];
          const idsUnicos = new Set();
          let peliculasEncontradas = await Promise.all(
            personas.map(async (persona) => {
              const creditosUrl = `https://api.themoviedb.org/3/person/${
                persona.id
              }/combined_credits?api_key=${
                import.meta.env.VITE_TMDB_API_KEY
              }&language=es-ES`;
              const creditosRes = await fetch(creditosUrl);
              const creditos = await creditosRes.json();

              const lista =
                modoBusqueda === "actor"
                  ? creditos.cast
                  : creditos.crew?.filter((c) => c.job === "Director");

              return (lista || []).filter(
                (item) =>
                  item.media_type === tipoReal &&
                  item.id &&
                  !idsUnicos.has(item.id) &&
                  idsUnicos.add(item.id) // ← esto añade y evita duplicados
              );
            })
          );

          // Aplanar el array de arrays
          peliculasEncontradas = peliculasEncontradas.flat();

          // Ordenar
          peliculasEncontradas.sort((a, b) => b.popularity - a.popularity);

          // Finalmente, set
          setPeliculas(peliculasEncontradas);

          setTotalPaginas(1);
          totalPaginasRef.current = 1;
          return;
        }

        if (!texto) {
          // ✅ discover: filtros nativos
          url = `https://api.themoviedb.org/3/discover/${tipoReal}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES&page=${pageParam}&sort_by=${ordenReal}${
            generoReal ? `&with_genres=${generoReal}` : ""
          }`;

          const res = await fetch(url);
          data = await res.json();
        } else {
          // 🔎 search por título
          url = `https://api.themoviedb.org/3/search/${tipoReal}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&query=${encodeURIComponent(
            texto
          )}&language=es-ES&page=${pageParam}`;

          const res = await fetch(url);
          data = await res.json();

          let resultados = Array.isArray(data.results) ? data.results : [];

          // 🎯 Filtrado por género (solo si se seleccionó uno)
          if (generoReal) {
            resultados = resultados.filter(
              (item) =>
                Array.isArray(item.genre_ids) &&
                item.genre_ids.includes(Number(generoReal))
            );
          }

          // 🔃 Orden manual
          resultados.sort((a, b) => {
            const campo = ordenReal.split(".")[0]; // e.g., 'popularity' o 'release_date'
            const ordenDesc = ordenReal.endsWith(".desc");

            let valA = a[campo];
            let valB = b[campo];

            if (campo === "release_date") {
              valA = new Date(
                a.release_date || a.first_air_date || "1900-01-01"
              );
              valB = new Date(
                b.release_date || b.first_air_date || "1900-01-01"
              );
            }

            if (valA < valB) return ordenDesc ? 1 : -1;
            if (valA > valB) return ordenDesc ? -1 : 1;
            return 0;
          });

          data.results = resultados;
          data.total_pages = 1;
        }

        setPeliculas(Array.isArray(data.results) ? data.results : []);
        const total = Math.min(data.total_pages || 1, 500);
        setTotalPaginas(total);
        totalPaginasRef.current = total;
      } catch (error) {
        console.error("Error al buscar:", error);
        setPeliculas([]);
        setTotalPaginas(1);
      }
    },
    [busqueda, tipo, generoSeleccionado, orden, modoBusqueda]
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
    buscarPeliculas(pagina);
  }, [buscando, pagina, estadoRestaurado, buscarPeliculas]);

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
      <h2 className="sin-fondo titulo-seccion d-flex align-items-center gap-2 mb-3">
        {tipo === "movie" ? (
          <FaVideo size={22} style={{ fontSize: "1.6rem" }} />
        ) : (
          <FaTv size={22} style={{ fontSize: "1.6rem" }} />
        )}
        {tipo === "movie" ? "Películas" : "Series"}
      </h2>

      <br />
      <div className="input-group mb-2 sin-fondo">
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
          disabled={
            (modoBusqueda === "actor" || modoBusqueda === "director") &&
            busqueda.trim() === ""
          }
          onClick={() => {
            if (
              (modoBusqueda === "actor" || modoBusqueda === "director") &&
              busqueda.trim() === ""
            ) {
              toast.warning(
                "Introduce un nombre para buscar por actor/director."
              );
              return;
            }
            setPagina(1);
            setBuscando(true);
            buscarPeliculas(1);
          }}
        >
          Buscar
        </button>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap align-items-center sin-fondo">
        <select
          className="form-select w-auto"
          value={tipo}
          onChange={(e) => {
            const nuevoTipo = e.target.value;
            setTipo(nuevoTipo);
            setPagina(1);
            setBuscando(true);
            buscarPeliculas({
              pagina: 1,
              tipoOverride: nuevoTipo,
            });
          }}
        >
          <option value="movie">Películas</option>
          <option value="tv">Series</option>
        </select>

        <select
          className="form-select w-auto"
          value={generoSeleccionado}
          onChange={(e) => {
            const nuevoGenero = e.target.value;
            setGeneroSeleccionado(nuevoGenero);
            setPagina(1);
            setBuscando(true);
            buscarPeliculas({
              pagina: 1,
              generoOverride: nuevoGenero,
            });
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
        <select
          className="form-select w-auto"
          value={orden}
          onChange={(e) => {
            const nuevoOrden = e.target.value;
            setOrden(nuevoOrden);
            setPagina(1);
            setBuscando(true);
            buscarPeliculas({
              pagina: 1,
              ordenOverride: nuevoOrden,
            });
          }}
        >
          <option value="popularity.desc">Más populares</option>
          <option value="popularity.asc">Menos populares</option>
          <option value="release_date.desc">Más recientes</option>
          <option value="release_date.asc">Más antiguas</option>
          <option value="vote_average.desc">Mejor valoradas</option>
          <option value="vote_average.asc">Peor valoradas</option>
        </select>

        <button
          className="btn btn-light border btn-sm shadow-sm"
          onClick={reiniciarFiltros}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Reiniciar filtros
        </button>
      </div>

      {peliculas.length === 0 ? (
        <div className="text-warning mt-3">
          <p>No se encontraron resultados con los criterios seleccionados.</p>
          <button
            className="btn btn-light btn-sm mt-2"
            onClick={() => {
              reiniciarFiltros();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Reiniciar búsqueda
          </button>
        </div>
      ) : (
        <div className="row">
          {peliculas.length > 0 && (
            <div className="d-flex justify-content-center my-4 flex-wrap gap-2">
              {/* Primera página */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${pagina === 1 ? "disabled" : ""}`}
                onClick={() => setPagina(1)}
                title="Primera página"
              >
                <BsChevronDoubleLeft />
              </motion.button>

              {/* Anterior */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${pagina === 1 ? "disabled" : ""}`}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                title="Anterior"
              >
                <BsChevronLeft />
              </motion.button>

              {/* Números de página */}
              {Array.from({ length: 5 }, (_, i) => pagina - 2 + i)
                .filter((p) => p >= 1 && p <= totalPaginas)
                .map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => setPagina(p)}
                    className={`pagination-btn ${p === pagina ? "active" : ""}`}
                  >
                    {p}
                  </motion.button>
                ))}

              {/* Siguiente */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${
                  pagina === totalPaginas ? "disabled" : ""
                }`}
                onClick={() => setPagina((p) => p + 1)}
                title="Siguiente"
              >
                <BsChevronRight />
              </motion.button>

              {/* Última página */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${
                  pagina === totalPaginas ? "disabled" : ""
                }`}
                disabled={
                  !Number.isInteger(totalPaginas) || pagina === totalPaginas
                }
                onClick={() => {
                  const esValida =
                    Number.isInteger(totalPaginas) && totalPaginas > 0;
                  if (esValida && pagina !== totalPaginas) {
                    setPagina(totalPaginas);
                    const ejecutar = buscando
                      ? buscarPeliculas
                      : fetchPopulares;
                    ejecutar(totalPaginas);
                  }
                }}
                title="Última página"
              >
                <BsChevronDoubleRight />
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
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${pagina === 1 ? "disabled" : ""}`}
                onClick={() => setPagina(1)}
                title="Primera página"
              >
                <BsChevronDoubleLeft />
              </motion.button>

              {/* Anterior */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${pagina === 1 ? "disabled" : ""}`}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                title="Anterior"
              >
                <BsChevronLeft />
              </motion.button>

              {/* Números de página */}
              {Array.from({ length: 5 }, (_, i) => pagina - 2 + i)
                .filter((p) => p >= 1 && p <= totalPaginas)
                .map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => setPagina(p)}
                    className={`pagination-btn ${p === pagina ? "active" : ""}`}
                  >
                    {p}
                  </motion.button>
                ))}

              {/* Siguiente */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${
                  pagina === totalPaginas ? "disabled" : ""
                }`}
                onClick={() => setPagina((p) => p + 1)}
                title="Siguiente"
              >
                <BsChevronRight />
              </motion.button>

              {/* Última página */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`pagination-btn ${
                  pagina === totalPaginas ? "disabled" : ""
                }`}
                disabled={
                  !Number.isInteger(totalPaginas) || pagina === totalPaginas
                }
                onClick={() => {
                  const esValida =
                    Number.isInteger(totalPaginas) && totalPaginas > 0;
                  if (esValida && pagina !== totalPaginas) {
                    setPagina(totalPaginas);
                    const ejecutar = buscando
                      ? buscarPeliculas
                      : fetchPopulares;
                    ejecutar(totalPaginas);
                  }
                }}
                title="Última página"
              >
                <BsChevronDoubleRight />
              </motion.button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Home;
