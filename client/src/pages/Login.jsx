import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
const registrado = location.state?.registrado || false;


  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [token, setToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      setMensaje(res.data.mensaje);
      setToken(res.data.token);
  
      // Guardar token y redirigir
      localStorage.setItem('token', res.data.token);
      navigate('/home'); // <--- aquí se usa
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  };
  

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="bg-dark p-4 rounded shadow" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#2a2a2a' }}
      >
        <h2 className="mb-4 text-center text-light">Iniciar Sesión</h2>

        {registrado && (
          <div className="alert alert-success">
            Te has registrado correctamente. Inicia sesión para continuar.
          </div>
        )}

        {mensaje && <div className="alert alert-info">{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
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
            <label htmlFor="password" className="form-label">Contraseña</label>
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
          <button type="submit" className="btn btn-success w-100">Entrar</button>
        </form>

        {token && (
          <div className="mt-3">
            <strong>Token:</strong>
            <pre className="bg-light p-2">{token}</pre>
          </div>
        )}
      </div>
    </div>
  );

};

export default Login;
