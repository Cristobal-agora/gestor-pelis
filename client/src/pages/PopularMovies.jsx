import React, { useEffect, useState } from 'react';

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
    <div className="container mt-4 text-light">
      <h2 className="mb-4">🎥 Películas Populares</h2>
      <div className="row">
        {peliculas.map((peli) => (
          <div key={peli.id} className="col-md-3 mb-4">
            <div className="card bg-dark text-white h-100">
              <img
                src={`https://image.tmdb.org/t/p/w500${peli.poster_path}`}
                className="card-img-top"
                alt={peli.title}
              />
              <div className="card-body">
                <h5 className="card-title">{peli.title}</h5>
                <p className="card-text">⭐ {peli.vote_average}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularMovies;
