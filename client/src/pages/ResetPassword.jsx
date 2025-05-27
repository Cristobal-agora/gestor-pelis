import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmar) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, nuevaPassword: password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Contraseña restablecida correctamente. Redirigiendo...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error(data.error || "Error al restablecer la contraseña.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión con el servidor.");
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
            Restablecer contraseña
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-light">Nueva contraseña</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-light">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
            >
              Cambiar contraseña
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ResetPassword;
