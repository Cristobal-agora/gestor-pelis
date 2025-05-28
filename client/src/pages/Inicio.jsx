import React, { useEffect, useState } from "react";
import Carrusel from "../components/Carrusel";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaFilm, FaStar, FaFire, FaUser } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const directoresDestacados = [
  "Christopher Nolan",
  "Quentin Tarantino",
  "Denis Villeneuve",
  "Steven Spielberg",
  "Martin Scorsese",
  "Sofia Coppola",
];

const Inicio = () => {
  const [populares, setPopulares] = useState([]);
  const [mejorValoradas, setMejorValoradas] = useState([]);
  const [proximosEstrenos, setProximosEstrenos] = useState([]);
  const [directores, setDirectores] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const resPopulares = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES&page=1`
        );

        const resValoradas = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES&page=1`
        );

        const resEstrenos = await axios.get(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES&page=1`
        );

        const directoresPromesas = directoresDestacados.map(async (nombre) => {
          const res = await axios.get(
            `https://api.themoviedb.org/3/search/person?api_key=${
              import.meta.env.VITE_TMDB_API_KEY
            }&query=${encodeURIComponent(nombre)}&language=es-ES`
          );
          const persona = res.data.results.find(
            (p) => p.known_for_department === "Directing"
          );
          return persona
            ? {
                id: persona.id,
                nombre: persona.name,
                foto: persona.profile_path
                  ? `https://image.tmdb.org/t/p/w185${persona.profile_path}`
                  : "/avatars/default.jpg",
              }
            : null;
        });

        const resultados = await Promise.all(directoresPromesas);
        setPopulares(resPopulares.data.results.slice(0, 6));
        setMejorValoradas(resValoradas.data.results.slice(0, 6));
        setProximosEstrenos(resEstrenos.data.results.slice(0, 6));
        setDirectores(resultados.filter((dir) => dir !== null));
      } catch (error) {
        console.error("Error al cargar datos de TMDb", error);
      }
    };

    fetchDatos();
  }, []);

  const renderPeliculas = (titulo, icono, peliculas) => (
    <section className="mb-5">
      <h3 className="text-azul-suave sin-fondo mb-3 d-flex align-items-center gap-2">
        {icono} {titulo}
      </h3>
      <div className="row">
        {peliculas.map((pelicula, index) => (
          <motion.div
            key={pelicula.id}
            className="col-6 col-md-4 col-lg-2 mb-3"
            onClick={() => {
              if (token) {
                navigate(`/movie/${pelicula.id}`);
              } else {
                navigate("/login");
              }
            }}
            style={{ cursor: "pointer" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`}
              alt={pelicula.title}
              className="img-fluid rounded shadow pelicula-hover"
            />
            <p className="mt-2 text-center small text-light">
              {pelicula.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="inicio container mt-4">
      <div className="carrusel-container mb-5">
        <Carrusel />
      </div>

      {renderPeliculas("Próximos estrenos", <FaFilm />, proximosEstrenos)}
      {renderPeliculas("Películas populares", <FaFire />, populares)}
      {renderPeliculas("Mejor valoradas", <FaStar />, mejorValoradas)}

      <section className="mb-5">
        <h3 className="text-azul-suave sin-fondo mb-4 d-flex align-items-center justify-content-center gap-2">
          <FaUser /> Directores destacados
        </h3>
        <div className="row justify-content-center">
          {directores.map((dir, index) => (
            <motion.div
              key={index}
              className="col-6 col-md-4 col-lg-2 text-center mb-4"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/director/${dir.id}`)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <img
                src={dir.foto}
                alt={dir.nombre}
                className="mx-auto d-block rounded-circle mb-2 shadow director-hover"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  border: "2px solid #1f8df5",
                }}
              />
              <p className="text-light small">{dir.nombre}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Inicio;
