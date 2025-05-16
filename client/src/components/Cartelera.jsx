import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const Cartelera = () => {
  const [peliculas, setPeliculas] = useState([]);
  const contenedorRef = useRef(null);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES&region=ES`
    )
      .then((res) => res.json())
      .then((data) => {
        const conPoster = data.results?.filter((p) => p.poster_path);
        setPeliculas(conPoster.slice(0, 12)); // máximo 12 con imagen
      });
  }, []);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || window.innerWidth < 768) return;

    let animationFrameId;
    const velocidad = 0.5; // píxeles por frame

    const scrollContinuo = () => {
      const maxScroll = contenedor.scrollWidth - contenedor.clientWidth;

      if (contenedor.scrollLeft >= maxScroll - 1) {
        contenedor.scrollLeft = 0;
      } else {
        contenedor.scrollLeft += velocidad;
      }

      animationFrameId = requestAnimationFrame(scrollContinuo);
    };

    animationFrameId = requestAnimationFrame(scrollContinuo);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="text-light">
      <h3 className="text-primary mb-3">🎬 Cartelera en cines</h3>

      <div
        ref={contenedorRef}
        className="d-flex overflow-auto gap-3"
        style={{
          scrollbarWidth: "none",
          paddingBottom: "0.5rem",
          marginBottom: "0",
          scrollBehavior: "auto", // ← IMPORTANTE
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
                className="img-fluid rounded shadow"
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
