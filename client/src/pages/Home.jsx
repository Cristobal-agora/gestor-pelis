import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Asegúrate de tener esto arriba del archivo

const Home = () => {
  const token = localStorage.getItem('token');

  const [peliculas, setPeliculas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [generos, setGeneros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState('');

  // Obtener géneros al cargar
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`)
      .then(res => res.json())
      .then(data => setGeneros(data.genres));
  }, []);

  // Cargar películas populares por defecto
  useEffect(() => {
    fetchPopulares();
  }, []);

  const fetchPopulares = async () => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`);
      const data = await res.json();
      setPeliculas(data.results);
    } catch (error) {
      console.error('Error al cargar películas populares:', error);
    }
  };

  const buscarPeliculas = async () => {
    const url = generoSeleccionado
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${generoSeleccionado}&language=es-ES`
      : `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${busqueda}&language=es-ES`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setPeliculas(data.results);
    } catch (error) {
      console.error('Error al buscar películas:', error);
    }
  };

  return (
    <div className="container mt-4 text-light">
      <h2>Bienvenido</h2>
      {token ? (
        <p>Has iniciado sesión correctamente. Puedes acceder a contenido privado.</p>
      ) : (
        <p>No tienes sesión iniciada.</p>
      )}

      <hr />

      <h3>🎬 Películas Populares</h3>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar películas por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn btn-primary" onClick={buscarPeliculas}>Buscar</button>
      </div>

      <div className="mb-3">
        <select
          className="form-select"
          value={generoSeleccionado}
          onChange={(e) => setGeneroSeleccionado(e.target.value)}
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="row">
        {peliculas.map((peli) => (
          <div key={peli.id} className="col-md-3 mb-4">
            <div className="card bg-dark text-white h-100">

<Link to={`/pelicula/${peli.id}`}>
  <img
    src={`https://image.tmdb.org/t/p/w500${peli.poster_path}`}
    className="card-img-top"
    alt={peli.title}
    style={{ cursor: 'pointer' }}
  />
</Link>

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

export default Home;
