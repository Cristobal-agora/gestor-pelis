const db = require("../config/db");

async function marcarVista(req, res) {
  const usuarioId = req.usuario.id;
  const { tmdb_id, tipo } = req.body;

  try {
    await db.query(
      `INSERT INTO historial (usuario_id, tmdb_id, tipo)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [usuarioId, tmdb_id, tipo]
    );
    res.status(200).json({ mensaje: "Contenido marcado como visto" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al marcar como visto" });
  }
}

async function desmarcarVista(req, res) {
  const usuarioId = req.usuario.id;
  const { tmdbId, tipo } = req.params;

  try {
    await db.query(
      "DELETE FROM historial WHERE usuario_id = $1 AND tmdb_id = $2 AND tipo = $3",
      [usuarioId, tmdbId, tipo]
    );
    res.status(200).json({ mensaje: "Contenido desmarcado como visto" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al desmarcar" });
  }
}

async function obtenerHistorial(req, res) {
  try {
    const { id } = req.usuario;
    const tipo = req.query.tipo || "movie";

    const result = await db.query(
      "SELECT tmdb_id FROM historial WHERE usuario_id = $1 AND tipo = $2",
      [id, tipo]
    );

    res.json(result.rows.map((r) => r.tmdb_id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}

module.exports = {
  marcarVista,
  desmarcarVista,
  obtenerHistorial,
};
