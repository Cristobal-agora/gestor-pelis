import React, { useState, useEffect, useCallback } from "react";
import { FaCommentDots, FaTrashAlt, FaPaperPlane } from "react-icons/fa";

const Comentarios = ({ tmdbId, tipo, modoClaro }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const token = sessionStorage.getItem("token");
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  const obtenerComentarios = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios/${tipo}/${tmdbId}`
      );
      const data = await res.json();
      setComentarios(data);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  }, [tipo, tmdbId]);

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdb_id: tmdbId,
          tipo,
          contenido: nuevoComentario,
        }),
      });

      if (res.ok) {
        setNuevoComentario("");
        obtenerComentarios();
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  const borrarComentario = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/comentarios/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setComentarios(comentarios.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error al borrar comentario:", error);
    }
  };

  useEffect(() => {
    obtenerComentarios();
  }, [obtenerComentarios]);

  return (
    <div
      className="modal fade"
      id="modalComentarios"
      tabIndex="-1"
      aria-labelledby="comentariosLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div
          className={`modal-content ${
            modoClaro ? "bg-light text-dark" : "bg-dark text-light"
          } border-secondary`}
        >
          <div className="modal-header border-secondary">
            <h5
              className="modal-title d-flex align-items-center gap-2"
              id="comentariosLabel"
            >
              <FaCommentDots className="text-info" />
              Comentarios
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>
         <div className="modal-body modal-body-scrollable">

            {comentarios.length === 0 ? (
              <p>No hay comentarios todavía.</p>
            ) : (
              <ul className="list-unstyled">
                {comentarios.map((comentario) => (
                  <li
                    key={comentario.id}
                    className={`comentario-animado mb-3 p-3 rounded-4 ${
                      modoClaro
                        ? "bg-white text-dark border border-info"
                        : "bg-secondary bg-opacity-10 text-light border border-info-subtle"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong
                          style={{
                            color: modoClaro ? "#0077cc" : "#00bfff",
                            fontWeight: "600",
                          }}
                        >
                          {comentario.nombre}
                        </strong>
                        <small
                          className={`ms-2 ${
                            modoClaro ? "text-muted" : "text-light"
                          }`}
                        >
                          {comentario.creado_en &&
                          !isNaN(Date.parse(comentario.creado_en))
                            ? new Date(comentario.creado_en).toLocaleString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Fecha desconocida"}
                        </small>
                      </div>
                      {token && usuario?.id === comentario.usuario_id && (
                        <button
                          className="btn btn-sm p-0 border-0 bg-transparent"
                          title="Eliminar comentario"
                          onClick={() => borrarComentario(comentario.id)}
                        >
                          <FaTrashAlt className="text-danger" />
                        </button>
                      )}
                    </div>
                    <p className="mb-0">{comentario.contenido}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer border-secondary d-flex flex-column flex-md-row gap-2 align-items-end">
            <textarea
              className="form-control flex-grow-1"
              rows="2"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              style={{
                resize: "none",
                backgroundColor: "#fff", // blanco en ambos modos
                color: "#000", // texto negro siempre
                borderColor: modoClaro ? "#ccc" : "#555",
              }}
            />
            <button
              className="btn btn-comentarios"
              onClick={enviarComentario}
              disabled={!nuevoComentario.trim()}
            >
              <FaPaperPlane /> Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comentarios;
