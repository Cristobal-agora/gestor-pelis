import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/register`, formData);
      setMensaje(res.data.mensaje);

      // Redirigir al login con mensaje
      navigate('/login', { state: { registrado: true } });
    } catch (error) {
      console.error(error);

      if (error.response?.data?.errores) {
        const errores = error.response.data.errores.map(err => `• ${err.msg}`).join('\n');
        setMensaje(errores);
      } else {
        setMensaje(error.response?.data?.mensaje || 'Error en el registro');
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="p-4 rounded shadow" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#2a2a2a' }}>
        <h2 className="mb-4 text-center text-light">Registro</h2>

        {mensaje && (
          <div className="alert alert-info text-start">
            {mensaje.split('\n').map((linea, index) => (
              <div key={index}>{linea}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label text-light">Nombre</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-light">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-light">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
