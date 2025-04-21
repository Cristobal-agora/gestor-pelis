import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const toggleFavorito = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/favoritos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          peliculaId: pelicula.id,
          titulo: pelicula.title,
          poster: pelicula.poster_path
        })
      });
  
      if (res.ok) {
        setEsFavorito(!esFavorito);
      } else {
        const data = await res.json();
        alert(data.mensaje || 'Error al guardar favorito');
      }
    } catch (error) {
      console.error('Error al guardar favorito:', error);
    }
  };
  


  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`)
      .then(res => res.json())
      .then(data => setPelicula(data));
  }, [id]);

  if (!pelicula) return <div className="text-light">Cargando...</div>;

  return (
    <div className="container mt-4 text-light">
      <h2>{pelicula.title}</h2>
      <div className="row">
        <div className="col-md-4">
          <img src={`https://image.tmdb.org/t/p/w500${pelicula.poster_path}`} className="img-fluid" alt={pelicula.title} />
        </div>
        <div className="col-md-8">
          <p><strong>Resumen:</strong> {pelicula.overview}</p>
          <p><strong>Fecha de estreno:</strong> {pelicula.release_date}</p>
          <p><strong>Valoración:</strong> ⭐ {pelicula.vote_average}</p>

          {/* Botón estrella */}
          <button
  className="btn"
  style={{ fontSize: '1.8rem', color: esFavorito ? 'yellow' : 'gray' }}
  onClick={toggleFavorito}
>
  ★
</button>

        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
