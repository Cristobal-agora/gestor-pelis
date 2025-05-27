import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CambiarPassword = () => {
  const [formData, setFormData] = useState({
    passwordActual: "",
    nuevaPassword: "",
  });

  const token = sessionStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { passwordActual, nuevaPassword } = formData;
    const errores = [];

    if (!passwordActual.trim()) {
      errores.push("La contraseña actual es obligatoria.");
    }

    if (!nuevaPassword.trim()) {
      errores.push("La nueva contraseña es obligatoria.");
    } else {
      if (nuevaPassword.length < 6) {
        errores.push("La nueva contraseña debe tener al menos 6 caracteres.");
      }
      if (!/[A-Za-z]/.test(nuevaPassword)) {
        errores.push("La nueva contraseña debe contener al menos una letra.");
      }
      if (!/\d/.test(nuevaPassword)) {
        errores.push("La nueva contraseña debe contener al menos un número.");
      }
      if (/\s/.test(nuevaPassword)) {
        errores.push("La nueva contraseña no puede contener espacios.");
      }
      if (nuevaPassword === passwordActual) {
        errores.push("La nueva contraseña debe ser distinta de la actual.");
      }
    }

    if (errores.length > 0) {
      errores.forEach((err) => toast.error(err));
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/usuarios/password`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        res.data.mensaje || "Contraseña actualizada correctamente."
      );
      setFormData({ passwordActual: "", nuevaPassword: "" });
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errores) {
        error.response.data.errores.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(
          error.response?.data?.mensaje || "Error al cambiar la contraseña."
        );
      }
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-primary mb-4">Cambiar contraseña</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-light">Contraseña actual</label>
          <input
            type="password"
            className="form-control bg-dark text-light border-secondary"
            name="passwordActual"
            value={formData.passwordActual}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-light">Nueva contraseña</label>
          <input
            type="password"
            className="form-control bg-dark text-light border-secondary"
            name="nuevaPassword"
            value={formData.nuevaPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn btn-primary fw-bold">
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
};

export default CambiarPassword;
