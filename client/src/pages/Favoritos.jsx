import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Favoritos = () => {
  const [items, setItems] = useState([]);
  const [tipo, setTipo] = useState('movie');
  const token = localStorage.getItem('token');
  

  const obtenerFavoritos = useCallback(async () => {
    if (!token) return;
    setItems([]);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const favoritos = await res.json();
    const filtrados = favoritos.filter(f => f.tipo === tipo);

    const detalles = await Promise.all(
      filtrados.map(f =>
        fetch(`https://api.themoviedb.org/3/${f.tipo}/${f.pelicula_id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`)
          .then(res => res.json())
          .catch(() => null)
      )
    );

    setItems(detalles.filter(p => p));
  }, [token, tipo]);

  useEffect(() => {
    obtenerFavoritos();
  }, [obtenerFavoritos]);

  const eliminarFavorito = async (id) => {
    if (!token) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favoritos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };


  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-4 text-primary">⭐ Mis Favoritos</h2>

      <div className="mb-4 d-flex align-items-center gap-3 flex-wrap">
        <label className="form-label mb-0 me-2">Tipo:</label>
        <select
          className="form-select w-auto"
          value={tipo}
          onChange={e => setTipo(e.target.value)}
        >
          <option value="movie">Películas</option>
          <option value="tv">Series</option>
        </select>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted ">
          No has agregado favoritos aún.
        </p>
      ) : (
        <div className="row">
          {items.map((item) => (
            <div key={item.id} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-4 position-relative">
  {/* Estrella de eliminación */}
  <button
    className="position-absolute top-0 end-0 m-2 border-0 bg-transparent"
    title="Quitar de favoritos"
    onClick={() => eliminarFavorito(item.id)}
    style={{ zIndex: 2 }}
  >
    <span style={{ fontSize: '1.5rem', color: '#1f8df5' }}>★</span>
  </button>

  <Link to={`/${tipo === 'movie' ? 'pelicula' : 'serie'}/${item.id}`} className="text-decoration-none" style={{ zIndex: 1 }}>
    <div className="card bg-dark text-white border-0 shadow-sm h-100 hover-scale">
      <img
        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
        className="card-img-top"
        alt={item.title || item.name}
        style={{ borderRadius: '8px', objectFit: 'cover' }}
      />
      <div className="card-body px-2 py-2">
        <h6 className="card-title mb-1">{item.title || item.name}</h6>
        <p className="card-text text-muted">⭐ {item.vote_average}</p>
      </div>
    </div>
  </Link>
</div>

          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
