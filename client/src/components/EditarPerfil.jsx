import React, { useEffect, useState } from "react";
import axios from "axios";

const EditarPerfil = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
  });

  const [mensaje, setMensaje] = useState("");
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
        setMensaje("Error al cargar el perfil.");
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
      setMensaje(errores.join("\n"));
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/usuarios/perfil`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje(res.data.mensaje || "Perfil actualizado correctamente.");
      // Actualiza también en sessionStorage si quieres reflejar el nuevo nombre:
      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      usuario.nombre = formData.nombre;
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errores) {
        const errores = error.response.data.errores
          .map((err) => `- ${err.msg}`)
          .join("\n");
        setMensaje(errores);
      } else {
        setMensaje(
          error.response?.data?.mensaje || "Error al actualizar el perfil."
        );
      }
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-primary mb-4">Editar perfil</h2>

      {mensaje && (
        <div className="alert alert-info text-start">
          {mensaje.split("\n").map((linea, i) => (
            <div key={i}>{linea}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
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

        <div className="mb-3">
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

        <button type="submit" className="btn btn-primary fw-bold">
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditarPerfil;
