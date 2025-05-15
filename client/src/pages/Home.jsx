import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
 const [token, setToken] = useState(localStorage.getItem("token"));

  const navigate = useNavigate();

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


  useEffect(() => {
  const checkToken = () => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (!storedToken) {
      navigate("/login", { replace: true });
    }
  };

  window.addEventListener("popstate", checkToken);
  return () => window.removeEventListener("popstate", checkToken);
}, [navigate]);

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
      } = JSON.parse(savedState);
      setBusqueda(busqueda);
      setGeneroSeleccionado(generoSeleccionado);
      setTipo(tipo);
      setModoBusqueda(modoBusqueda);
      setPagina(pagina);
      setOrden(orden);
      setBuscando(buscando);

      // Lanza la búsqueda si estaba buscando
      if (buscando) {
        setTimeout(() => {
          buscarPeliculas();
        }, 0);
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      busqueda,
      generoSeleccionado,
      tipo,
      modoBusqueda,
      pagina,
      orden,
      buscando,
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
  ]);

  const fetchPopulares = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${tipo}/popular?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&language=es-ES&page=${pagina}&include_adult=false&region=ES`
      );
      const data = await res.json();
      setPeliculas(data.results);
      setTotalPaginas(data.total_pages);
    } catch (error) {
      console.error("Error al cargar contenido popular:", error);
    }
  }, [tipo, pagina]);

  const buscarPeliculas = useCallback(async () => {
    try {
      if (!busqueda.trim()) {
        if (generoSeleccionado) {
          const url = `https://api.themoviedb.org/3/discover/${tipo}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&with_genres=${generoSeleccionado}&language=es-ES&page=${pagina}&sort_by=${orden}`;

          const res = await fetch(url);
          const data = await res.json();
          setPeliculas(data.results || []);
          setTotalPaginas(data.total_pages || 1);
        } else {
          fetchPopulares();
        }
        return;
      }

      if (modoBusqueda === "titulo") {
        let url = `https://api.themoviedb.org/3/search/${tipo}?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&query=${encodeURIComponent(busqueda)}&language=es-ES&page=${pagina}`;

        if (generoSeleccionado) {
          url += `&with_genres=${generoSeleccionado}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setPeliculas(data.results || []);
        setTotalPaginas(data.total_pages || 1);
      } else if (modoBusqueda === "actor") {
        const resActor = await fetch(
          `https://api.themoviedb.org/3/search/person?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&query=${encodeURIComponent(busqueda)}&language=es-ES`
        );
        const dataActor = await resActor.json();
        const persona = dataActor.results?.[0];

        if (!persona) {
          setPeliculas([]);
          setTotalPaginas(1);
          return;
        }

        const resCreditos = await fetch(
          `https://api.themoviedb.org/3/person/${
            persona.id
          }/${tipo}_credits?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES`
        );
        const dataCreditos = await resCreditos.json();

        const creditosFiltrados =
          dataCreditos.cast?.slice((pagina - 1) * 20, pagina * 20) || [];
        setPeliculas(creditosFiltrados);
        setTotalPaginas(Math.ceil(dataCreditos.cast?.length / 20) || 1);
      } else if (modoBusqueda === "director") {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/${tipo}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&query=${encodeURIComponent(busqueda)}&language=es-ES&page=${pagina}`
        );
        const data = await res.json();

        const detalles = await Promise.all(
          data.results?.map((item) =>
            fetch(
              `https://api.themoviedb.org/3/${tipo}/${
                item.id
              }/credits?api_key=${
                import.meta.env.VITE_TMDB_API_KEY
              }&language=es-ES`
            )
              .then((res) => res.json())
              .then((creditos) => {
                const esDirector = creditos.crew?.some(
                  (c) =>
                    c.job === "Director" &&
                    c.name.toLowerCase().includes(busqueda.toLowerCase())
                );
                return esDirector ? item : null;
              })
          )
        );

        const filtradas = detalles.filter((p) => p);
        setPeliculas(filtradas);
        setTotalPaginas(data.total_pages || 1);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setPeliculas([]);
      setTotalPaginas(1);
    }
  }, [
    tipo,
    pagina,
    busqueda,
    generoSeleccionado,
    modoBusqueda,
    orden,
    fetchPopulares,
  ]);

  useEffect(() => {
    if (buscando) {
      buscarPeliculas();
    } else {
      fetchPopulares();
    }
  }, [pagina, buscando, buscarPeliculas, fetchPopulares]);

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
    fetchPopulares();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const state = {
      busqueda,
      generoSeleccionado,
      tipo,
      modoBusqueda,
      pagina,
      orden,
    };
    sessionStorage.setItem("cineStashState", JSON.stringify(state));
  }, [busqueda, generoSeleccionado, tipo, modoBusqueda, pagina, orden]);

  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-2 text-primary">
        Explora {tipo === "movie" ? "Películas" : "Series"}
      </h2>

      {token ? (
        <p className="text-success">Has iniciado sesión correctamente.</p>
      ) : (
        <p className="text-warning">No tienes sesión iniciada.</p>
      )}

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
            buscarPeliculas(); // ejecuta búsqueda
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
            setOrden(e.target.value);
            setPagina(1);
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
        <p className="text-muted">Cargando contenido popular...</p>
      ) : (
        <div className="row">
          {peliculas.length > 0 && (
            <div className="d-flex justify-content-center my-4 flex-wrap gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === 1}
                onClick={() => setPagina(1)}
                title="Primera página"
              >
                ⏮
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
                title="Anterior"
              >
                ◀
              </button>
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
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
                title="Siguiente"
              >
                ▶
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(totalPaginas)}
                title="Última página"
              >
                ⏭
              </button>
            </div>
          )}

          {peliculas.map((peli) => (
            <div
              key={peli.id}
              className="col-6 col-sm-4 col-md-3 col-lg-5th mb-4"
            >
              <Link
                to={`/${tipo === "movie" ? "pelicula" : "serie"}/${peli.id}`}
                className="text-decoration-none"
              >
                <div className="card bg-dark text-white border-0 shadow-sm h-100 hover-scale">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${peli.poster_path}`}
                    className="card-img-top"
                    alt={peli.title || peli.name}
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div className="card-body px-2 py-2">
                    <h6 className="card-title mb-1">
                      {peli.title || peli.name}
                    </h6>
                    <p className="card-text text-muted">
                      ⭐ {peli.vote_average}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {peliculas.length > 0 && (
            <div className="d-flex justify-content-center my-4 flex-wrap gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === 1}
                onClick={() => setPagina(1)}
                title="Primera página"
              >
                ⏮
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
                title="Anterior"
              >
                ◀
              </button>
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
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
                title="Siguiente"
              >
                ▶
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(totalPaginas)}
                title="Última página"
              >
                ⏭
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
