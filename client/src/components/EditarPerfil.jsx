import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const EditarPerfil = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
  });

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/usuarios/perfil`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormData(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar el perfil.");
      }
    };

    cargarPerfil();
  }, [token]);

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

    if (errores.length > 0) {
      errores.forEach((err) => toast.error(err));
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/usuarios/perfil`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.mensaje || "Perfil actualizado correctamente.");

      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      usuario.nombre = formData.nombre;
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errores) {
        error.response.data.errores.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(
          error.response?.data?.mensaje || "Error al actualizar el perfil."
        );
      }
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="text-primary mb-4 text-center">Editar perfil</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sin-fondo">
            <label className="form-label text-light">Nombre</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="mb-3 sin-fondo">
            <label className="form-label text-light">Correo electrónico</label>
            <input
              type="email"
              className="form-control bg-dark text-light border-secondary"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn btn-primary fw-bold w-100">
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;
