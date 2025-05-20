import React, { useState, useEffect, useCallback } from "react";

const Comentarios = ({ tmdbId, tipo }) => {
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
      console.log("Comentarios recibidos:", data);
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
        <div className="modal-content bg-dark text-light border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title" id="comentariosLabel">
              💬 Comentarios
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">
            {comentarios.length === 0 ? (
              <p>No hay comentarios todavía.</p>
            ) : (
              <ul className="list-unstyled">
                {comentarios.map((comentario) => (
                  <li
                    key={comentario.id}
                    className="comentario-animado mb-3 p-3 bg-dark text-light rounded-3 shadow-sm border border-secondary"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong className="text-info">
                          {comentario.nombre}
                        </strong>
                        <small className="text-light ms-2">
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
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => borrarComentario(comentario.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="mb-0">{comentario.contenido}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <textarea
              className="form-control bg-dark text-light border-secondary"
              rows="2"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            />
            <button
              className="btn btn-primary mt-2"
              onClick={enviarComentario}
              disabled={!nuevoComentario.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comentarios;
