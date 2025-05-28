import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AuthBackground.css";

const Register = ({ mostrarVideoFondo }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errores = [];

    if (formData.nombre.trim().length < 2) {
      errores.push("El nombre debe tener al menos 2 caracteres.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errores.push("El correo electrónico no es válido.");
    }

    const password = formData.password;
    if (password.length < 6) {
      errores.push("La contraseña debe tener al menos 6 caracteres.");
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errores.push("La contraseña debe contener letras y números.");
    }

    if (errores.length > 0) {
      errores.forEach((err) => toast.error(err));
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        formData
      );

      toast.success(res.data.mensaje || "Registro exitoso");
      navigate("/login", { state: { registrado: true } });
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errores) {
        error.response.data.errores.forEach((err) =>
          toast.error(`- ${err.msg}`)
        );
      } else {
        toast.error(error.response?.data?.mensaje || "Error en el registro");
      }
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

      <div
        className="d-flex align-items-center justify-content-center auth-content"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="p-5 rounded shadow-lg"
          style={{
            maxWidth: "500px",
            width: "100%",
            backgroundColor: "rgba(28, 28, 28, 0.85)",
          }}
        >
          <h2 className="mb-4 text-center text-primary">Registro</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 sin-fondo">
              <label htmlFor="nombre" className="form-label text-light">
                Nombre
              </label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="mb-3 sin-fondo">
              <label htmlFor="email" className="form-label text-light">
                Correo electrónico
              </label>
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

            <div className="mb-3 sin-fondo">
              <label htmlFor="password" className="form-label text-light">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
