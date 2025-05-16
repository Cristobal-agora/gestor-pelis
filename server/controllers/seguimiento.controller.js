const db = require("../config/db");

exports.marcarVisto = async (req, res) => {
  const { serie_tmdb_id, temporada, episodio, tipo } = req.body;
  const usuario_id = req.usuario.id;

  try {
    await db.query(
      `INSERT INTO episodios_vistos (usuario_id, serie_tmdb_id, temporada, episodio)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (usuario_id, serie_tmdb_id, temporada, episodio) DO NOTHING`,
      [usuario_id, serie_tmdb_id, temporada, episodio]
    );

    res.json({ mensaje: "Episodio marcado como visto." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al guardar episodio." });
  }
};

exports.obtenerVistos = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { serie_tmdb_id } = req.params;

  try {
    const result = await db.query(
      `SELECT temporada, episodio FROM episodios_vistos
   WHERE usuario_id = $1 AND serie_tmdb_id = $2`,
      [usuario_id, serie_tmdb_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener episodios." });
  }
};

exports.borrarVisto = async (req, res) => {
  const usuario_id = req.usuario.id;
  const { serie_tmdb_id, temporada, episodio } = req.body;

  try {
    await db.query(
      `DELETE FROM episodios_vistos
   WHERE usuario_id = $1 AND serie_tmdb_id = $2 AND temporada = $3 AND episodio = $4`,
      [usuario_id, serie_tmdb_id, temporada, episodio]
    );

    res.json({ mensaje: "Episodio desmarcado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al borrar episodio." });
  }
};

exports.marcarVariosVistos = async (req, res) => {
  const usuario_id = req.usuario.id;
  const episodios = req.body;

  if (!Array.isArray(episodios) || episodios.length === 0) {
    return res.status(400).json({ mensaje: "Formato de datos inválido" });
  }

  try {
    const values = episodios
      .map(
        (ep, i) =>
          `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
      )
      .join(", ");

    const params = episodios.flatMap((ep) => [
      usuario_id,
      ep.serie_tmdb_id,
      ep.temporada,
      ep.episodio,
    ]);

    await db.query(
      `INSERT INTO episodios_vistos (usuario_id, serie_tmdb_id, temporada, episodio)
       VALUES ${values}
       ON CONFLICT (usuario_id, serie_tmdb_id, temporada, episodio) DO NOTHING`,
      params
    );

    res.json({ mensaje: "Episodios marcados correctamente." });
  } catch (error) {
    console.error("Error al marcar múltiples episodios:", error);
    res.status(500).json({ mensaje: "Error al marcar varios episodios." });
  }
};

exports.borrarVariosVistos = async (req, res) => {
  const usuario_id = req.usuario.id;
  const episodios = req.body;

  if (!Array.isArray(episodios) || episodios.length === 0) {
    return res.status(400).json({ mensaje: "Formato de datos inválido" });
  }

  try {
    const condiciones = episodios
      .map(
        (_, i) =>
          `(usuario_id = $1 AND serie_tmdb_id = $${
            i * 3 + 2
          } AND temporada = $${i * 3 + 3} AND episodio = $${i * 3 + 4})`
      )
      .join(" OR ");

    const params = episodios.flatMap((ep) => [
      ep.serie_tmdb_id,
      ep.temporada,
      ep.episodio,
    ]);

    await db.query(
      `DELETE FROM episodios_vistos
       WHERE ${episodios
         .map(
           (_, i) =>
             `(usuario_id = $1 AND serie_tmdb_id = $${
               i * 3 + 2
             } AND temporada = $${i * 3 + 3} AND episodio = $${i * 3 + 4})`
         )
         .join(" OR ")}`,
      [usuario_id, ...params]
    );

    res.json({ mensaje: "Episodios desmarcados correctamente." });
  } catch (error) {
    console.error("Error al desmarcar múltiples episodios:", error);
    res.status(500).json({ mensaje: "Error al desmarcar varios episodios." });
  }
};
