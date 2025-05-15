import React, { useEffect, useState } from "react";
import "./Carrusel.css";

const Carrusel = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchPopulares = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES`
        );
        const data = await res.json();
        setPeliculas(data.results.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar el carrusel:", error);
      }
    };

    fetchPopulares();
  }, []);

  useEffect(() => {
    if (peliculas.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % peliculas.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [peliculas]);

  if (peliculas.length === 0) return null;

  return (
    <div className="carrusel-wrapper">
      {peliculas.map((peli, index) => (
        <div
          key={peli.id}
          className={`carrusel-item ${index === activeIndex ? "active" : ""}`}
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${peli.backdrop_path})`,
          }}
        >
          <div className="carrusel-overlay">
            <h2>{peli.title}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Carrusel;
