import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const RecuperarPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/recuperar-password`,
        { email }
      );
      toast.success(
        res.data.mensaje ||
          "Si el correo está registrado, te hemos enviado un email con instrucciones."
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.mensaje ||
          "Error al procesar la solicitud. Inténtalo más tarde."
      );
    }
  };

  return (
    <div className="auth-background">
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
          <h2 className="mb-4 text-center text-primary">
            Recuperar contraseña
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 sin-fondo">
              <label htmlFor="email" className="form-label text-light">
                Correo electrónico
              </label>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Enviar instrucciones
            </button>

            <div className="text-center mt-3">
              <Link to="/login" className="text-info">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
