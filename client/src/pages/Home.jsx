import React from 'react';

const Home = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="container mt-5">
      <h2>Bienvenido</h2>
      {token ? (
        <p>Has iniciado sesión correctamente. Puedes acceder a contenido privado.</p>
      ) : (
        <p>No tienes sesión iniciada.</p>
      )}
    </div>
  );
};

export default Home;
