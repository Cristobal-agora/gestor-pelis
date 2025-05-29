import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaFilm } from "react-icons/fa";

const Cartelera = () => {
  const [peliculas, setPeliculas] = useState([]);
  const contenedorRef = useRef(null);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES&region=ES`
    )
      .then((res) => res.json())
      .then((data) => {
        const conPoster = data.results?.filter((p) => p.poster_path);
        setPeliculas(conPoster.slice(0, 12));
      });
  }, []);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || peliculas.length === 0) return;

    let animationFrameId;
    const velocidad = 0.5;
    let reanudarTimeout;

    const scrollContinuo = () => {
      if (pausado) {
        animationFrameId = requestAnimationFrame(scrollContinuo);
        return;
      }

      const maxScroll = contenedor.scrollWidth - contenedor.clientWidth;
      if (contenedor.scrollLeft >= maxScroll - 1) {
        contenedor.scrollTo({ left: 0, behavior: "auto" });
      } else {
        contenedor.scrollLeft += velocidad;
      }

      animationFrameId = requestAnimationFrame(scrollContinuo);
    };

    const pausar = () => {
      setPausado(true);
      clearTimeout(reanudarTimeout);
      reanudarTimeout = setTimeout(() => setPausado(false), 3000); // reanuda después de 3s
    };

    animationFrameId = requestAnimationFrame(scrollContinuo);

    // Eventos para ratón y táctil
    contenedor.addEventListener("mouseenter", () => setPausado(true));
    contenedor.addEventListener("mouseleave", () => setPausado(false));
    contenedor.addEventListener("touchstart", pausar);
    contenedor.addEventListener("touchmove", pausar);
    contenedor.addEventListener("touchend", pausar);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(reanudarTimeout);
      contenedor.removeEventListener("mouseenter", () => setPausado(true));
      contenedor.removeEventListener("mouseleave", () => setPausado(false));
      contenedor.removeEventListener("touchstart", pausar);
      contenedor.removeEventListener("touchmove", pausar);
      contenedor.removeEventListener("touchend", pausar);
    };
  }, [peliculas, pausado]);

  return (
    <div className="text-light">
      <h3
        className="titulo-cartelera text-azul-suave mb-3 d-flex align-items-center gap-2 sin-fondo"
        style={{ lineHeight: 1 }}
      >
        <FaFilm
          size={22}
          style={{
            position: "relative",
            top: "-1px",
            filter: "drop-shadow(0 0 1px #1f8df5)",
          }}
        />
        Cartelera en cines
      </h3>

      <div
        ref={contenedorRef}
        className="d-flex overflow-auto gap-3"
        style={{
          scrollbarWidth: "none",
          paddingBottom: "0.5rem",
          marginBottom: "0",
          scrollBehavior: "auto",
        }}
      >
        {peliculas.map((p) => (
          <Link
            key={p.id}
            to={`/pelicula/${p.id}`}
            className="text-decoration-none text-light"
            style={{ minWidth: "160px", scrollSnapAlign: "start" }}
          >
            <div className="text-center">
              <img
                src={`https://image.tmdb.org/t/p/w500${p.poster_path}`}
                alt={p.title}
                className="img-fluid rounded cartelera-img-hover"
                style={{
                  width: "160px",
                  height: "240px",
                  objectFit: "cover",
                }}
              />
              <p className="mt-2 small fw-semibold text-truncate">{p.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Cartelera;
