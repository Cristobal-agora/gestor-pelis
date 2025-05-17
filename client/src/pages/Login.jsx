import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthBackground.css';

const Login = ({ mostrarVideoFondo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrado = location.state?.registrado || false;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [mensaje, setMensaje] = useState(registrado ? '¡Registro exitoso! Inicia sesión para continuar.' : '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://gestor-pelis-production.up.railway.app/api/login", formData);

      setMensaje(res.data.mensaje);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      navigate('/home');
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="auth-background">
      {mostrarVideoFondo && (
        <video autoPlay loop muted className="auth-video-bg">
          <source src="/background.mp4" type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
      )}

      <div className="d-flex align-items-center justify-content-center auth-content" style={{ minHeight: '80vh' }}>
        <div className="p-5 rounded shadow-lg" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'rgba(28, 28, 28, 0.85)' }}>
          <h2 className="mb-4 text-center text-primary">Iniciar Sesión</h2>

          {mensaje && (
            <div className="alert alert-info text-center">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label text-light">Correo electrónico</label>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label text-light">Contraseña</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
