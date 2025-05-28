import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Director = () => {
  const { id } = useParams();
  const [peliculas, setPeliculas] = useState([]);
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeliculas = async () => {
      try {
        const resDetalles = await axios.get(
          `https://api.themoviedb.org/3/person/${id}?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES`
        );
        setNombre(resDetalles.data.name);

        const resCreditos = await axios.get(
          `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES`
        );
        const dirigidas = resCreditos.data.crew.filter(
          (item) => item.job === "Director"
        );
        setPeliculas(dirigidas);
      } catch (error) {
        console.error("Error al cargar filmografía del director", error);
      }
    };

    fetchPeliculas();
  }, [id]);

  return (
    <div className="container mt-4">
      <h2 className="text-azul-suave mb-4">Películas dirigidas por {nombre}</h2>
      <div className="row">
        {peliculas.map((peli) => (
          <div
            key={peli.id}
            className="col-6 col-md-4 col-lg-2 mb-3"
            onClick={() => {
              const token = sessionStorage.getItem("token");
              if (token) {
                navigate(`/movie/${peli.id}`);
              } else {
                navigate("/login");
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${peli.poster_path}`}
              alt={peli.title}
              className="img-fluid rounded shadow pelicula-hover"
            />
            <p className="mt-2 text-center small text-light">{peli.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Director;
