import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AuthBackground.css";

const Login = ({ mostrarVideoFondo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrado = location.state?.registrado || false;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    if (registrado) {
      toast.success("¡Registro exitoso! Inicia sesión para continuar.");
    }
  }, [registrado]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errores.push("El correo electrónico es obligatorio.");
    } else if (!emailRegex.test(formData.email)) {
      errores.push("El correo electrónico no es válido.");
    }

    if (!formData.password.trim()) {
      errores.push("La contraseña es obligatoria.");
    } else if (/\s/.test(formData.password)) {
      errores.push("La contraseña no puede contener espacios.");
    }

    if (errores.length > 0) {
      errores.forEach((err) => toast.error(err));
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        formData
      );

      toast.success("Inicio de sesión exitoso");
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      navigate("/home");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errores) {
        error.response.data.errores.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.mensaje || "Error al iniciar sesión");
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
          <h2 className="mb-4 text-center text-primary">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
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

            <div className="mb-4">
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
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Entrar
            </button>
            <div className="mt-3 d-flex justify-content-between">
              <button
                type="button"
                onClick={() => navigate("/recuperar-password")}
                className="btn btn-link p-0 text-light"
              >
                ¿Has olvidado tu contraseña?
              </button>

              <button
                type="button"
                className="btn btn-link p-0 text-primary fw-bold"
                style={{ textDecoration: "none" }}
                onClick={() => navigate("/register")}
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
