import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PopularMovies = () => {
  const [peliculas, setPeliculas] = useState([]);

  useEffect(() => {
    const fetchPopulares = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`);
        const data = await res.json();
        setPeliculas(data.results);
      } catch (error) {
        console.error('Error al cargar películas populares:', error);
      }
    };

    fetchPopulares();
  }, []);

  return (
    <div className="container mt-5 text-light">
      <h2 className="mb-4 text-primary">🎥 Películas Populares</h2>
      <div className="row">
        {peliculas.map((peli) => (
          <div key={peli.id} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4">
            <Link to={`/pelicula/${peli.id}`} className="text-decoration-none">
              <div className="card bg-dark text-white border-0 shadow-sm h-100 hover-scale">
                <img
                  src={`https://image.tmdb.org/t/p/w500${peli.poster_path}`}
                  className="card-img-top"
                  alt={peli.title}
                  style={{ borderRadius: '8px', objectFit: 'cover' }}
                />
                <div className="card-body px-2 py-2">
                  <h6 className="card-title mb-1">{peli.title}</h6>
                  <p className="card-text text-muted">⭐ {peli.vote_average}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularMovies;
