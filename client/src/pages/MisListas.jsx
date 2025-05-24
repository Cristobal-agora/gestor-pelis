import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFolderOpen, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const MisListas = ({ modoClaro }) => {
  const [listas, setListas] = useState([]);
  const [nuevaLista, setNuevaLista] = useState("");
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const obtenerListas = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/listas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las listas");
      const data = await res.json();
      setListas(data);
    } catch (err) {
      console.error("Error cargando listas:", err);
      setError("Hubo un problema al cargar tus listas.");
    }
  }, [token]);

  const crearLista = async () => {
    if (!token) return;
    if (!nuevaLista.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/listas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nuevaLista }),
      });

      if (!res.ok) throw new Error("Error al crear la lista");
      setNuevaLista("");
      await obtenerListas();
    } catch (err) {
      console.error("Error al crear lista:", err);
      toast.error("No se pudo crear la lista");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirige si no hay sesión
      return;
    }
    obtenerListas();
  }, [obtenerListas, token, navigate]);

  return (
    <div className={`container mt-4 ${modoClaro ? "text-dark" : "text-light"}`}>
      <h2 className="mb-3 text-primary d-flex align-items-center gap-2">
        <FaFolderOpen /> Mis Listas
      </h2>

      <div className="d-flex gap-3 mb-4">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Nombre de la nueva lista"
          value={nuevaLista}
          onChange={(e) => setNuevaLista(e.target.value)}
        />
        <button
          className="btn btn-crear-lista"
          onClick={crearLista}
          style={{
            backgroundColor: "#28a745",
            color: "#fff",
            borderRadius: "999px",
            fontWeight: "500",
            padding: "0.45rem 1.25rem",
          }}
        >
          Crear
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {listas.length === 0 ? (
        <p className="text-ligth">No tienes listas creadas aún.</p>
      ) : (
        <ul className="list-group">
          {listas.map((lista) => (
            <li
              key={lista.id}
              className="list-group-item d-flex justify-content-between align-items-center shadow-sm"
              style={{
                borderRadius: "12px",
                padding: "0.8rem 1rem",
                backgroundColor: modoClaro ? "#f1f1f1" : "#3c474ab1",
                color: modoClaro ? "#000" : "#ddd",
                border: modoClaro ? "1px solid #ccc" : "1px solid #333",
              }}
            >
              <Link
                to={`/lista/${lista.id}`}
                className="text-decoration-none"
                style={{ color: modoClaro ? "#1f8df5" : "#1f8df5" }}
              >
                {lista.nombre}
              </Link>

              <button
                className="btn btn-sm p-0 border-0 bg-transparent"
                title="Eliminar lista"
                onClick={() => {
                  confirmAlert({
                    customUI: ({ onClose }) => (
                      <div className="custom-confirm-alert">
                        <h1>¿Eliminar lista?</h1>
                        <p>¿Seguro que quieres eliminar "{lista.nombre}"?</p>
                        <div className="d-flex justify-content-end">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `${import.meta.env.VITE_API_URL}/listas/${
                                    lista.id
                                  }`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                if (res.ok) {
                                  setListas((prev) =>
                                    prev.filter((l) => l.id !== lista.id)
                                  );
                                  toast.success(
                                    "Lista eliminada correctamente"
                                  );
                                } else {
                                  const error = await res.json();
                                  toast.error(
                                    error.mensaje ||
                                      "Error al eliminar la lista"
                                  );
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error(
                                  "Error al conectar con el servidor"
                                );
                              } finally {
                                onClose();
                              }
                            }}
                          >
                            Sí, eliminar
                          </button>
                          <button onClick={onClose}>Cancelar</button>
                        </div>
                      </div>
                    ),
                  });
                }}
              >
                <FaTrashAlt className="icono-borrar-lista" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisListas;
