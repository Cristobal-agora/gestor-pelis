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
    <div className="mt-5">
      <h5 className="text-light mb-3">💬 Comentarios</h5>

      {comentarios.length === 0 && (
        <p className="text-ligth">No hay comentarios todavía.</p>
      )}

      <ul className="list-unstyled">
        {comentarios.map((comentario) => (
          <li
            key={comentario.id}
            className="mb-3 p-3 rounded bg-dark border border-secondary"
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong className="text-primary">{comentario.nombre}</strong>
              <small className="text-muted">
                {new Date(comentario.creada_en).toLocaleString()}
              </small>
            </div>
            <p className="text-light mb-1">{comentario.contenido}</p>
            {token && usuario?.id === comentario.usuario_id && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => borrarComentario(comentario.id)}
              >
                Borrar
              </button>
            )}
          </li>
        ))}
      </ul>

      {token && (
        <div className="mt-4">
          <textarea
            className="form-control bg-dark text-light"
            rows="3"
            placeholder="Escribe un comentario..."
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={enviarComentario}>
            Enviar
          </button>
        </div>
      )}
    </div>
  );
};

export default Comentarios;
