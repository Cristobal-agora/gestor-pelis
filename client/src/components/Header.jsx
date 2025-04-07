import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header-theme text-center py-5">
      <div className="header-inner">
        <h1 className="display-6 text-light mb-3">
          🎬 <span className="title-text">Gestor de Pelis</span>
        </h1>
        <div className="d-flex justify-content-center gap-3 mb-4">
          <Link to="/register" className="btn btn-outline-light">Registro</Link>
          <Link to="/login" className="btn btn-outline-light">Iniciar Sesión</Link>
        </div>

        {/* Carrusel */}
        <div
  id="movieCarousel"
  className="carousel carousel-fade"
  data-bs-ride="carousel"
  data-bs-interval="3000"
>
  <div className="carousel-inner rounded overflow-hidden">
  <div className="carousel-item active position-relative">
  <img
    src="https://image.tmdb.org/t/p/w1280/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg"
    className="d-block w-100"
    alt="Star Wars"
  />
  <div className="carousel-caption-custom">
    <h3>Star Wars</h3>
  </div>
</div>


<div className="carousel-item position-relative">
  <img
    src="https://image.tmdb.org/t/p/original/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg"
    className="d-block w-100"
    alt="El Señor de los Anillos"
  />
  <div className="carousel-caption-custom">
    <h3>El Señor de los Anillos</h3>
  </div>
</div>

<div className="carousel-item position-relative">
  <img
    src="https://image.tmdb.org/t/p/original/hziiv14OpD73u9gAak4XDDfBKa2.jpg"
    className="d-block w-100"
    alt="Harry Potter"
  />
  <div className="carousel-caption-custom">
    <h3>Harry Potter</h3>
  </div>
</div>
  </div>


  {/* Indicadores opcionales */}
  <div className="carousel-indicators">
    <button type="button" data-bs-target="#movieCarousel" data-bs-slide-to="0" className="active" />
    <button type="button" data-bs-target="#movieCarousel" data-bs-slide-to="1" />
    <button type="button" data-bs-target="#movieCarousel" data-bs-slide-to="2" />
  </div>

  {/* Flechas opcionales */}
  <button className="carousel-control-prev" type="button" data-bs-target="#movieCarousel" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" />
    <span className="visually-hidden">Anterior</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#movieCarousel" data-bs-slide="next">
    <span className="carousel-control-next-icon" />
    <span className="visually-hidden">Siguiente</span>
  </button>
</div>

      </div>
    </header>
  );
};

export default Header;
