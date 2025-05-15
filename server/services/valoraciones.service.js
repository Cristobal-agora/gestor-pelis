const db = require("../config/db");

async function crearOActualizarValoracion(usuario_id, tmdb_id, tipo, puntuacion) {
  const query = `
    INSERT INTO valoraciones (usuario_id, tmdb_id, tipo, puntuacion)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (usuario_id, tmdb_id, tipo)
    DO UPDATE SET puntuacion = EXCLUDED.puntuacion, creada_en = CURRENT_TIMESTAMP
  `;
  await db.query(query, [usuario_id, tmdb_id, tipo, puntuacion]);
}

async function obtenerValoracionesPorContenido(tmdb_id, tipo) {
  const result = await db.query(
    "SELECT v.*, u.nombre FROM valoraciones v JOIN usuarios u ON v.usuario_id = u.id WHERE v.tmdb_id = $1 AND v.tipo = $2",
    [tmdb_id, tipo]
  );
  return result.rows;
}

async function obtenerValoracionDeUsuario(usuario_id, tmdb_id, tipo) {
  const result = await db.query(
    "SELECT * FROM valoraciones WHERE usuario_id = $1 AND tmdb_id = $2 AND tipo = $3",
    [usuario_id, tmdb_id, tipo]
  );
  return result.rows[0];
}

async function eliminarValoracion(usuario_id, tmdb_id, tipo) {
  await db.query(
    "DELETE FROM valoraciones WHERE usuario_id = $1 AND tmdb_id = $2 AND tipo = $3",
    [usuario_id, tmdb_id, tipo]
  );
}

async function obtenerResumenValoraciones(usuario_id, tmdb_id, tipo) {
  // Media de todos los usuarios
  const { rows: media } = await db.query(
    `SELECT ROUND(AVG(puntuacion)::numeric, 1) AS media FROM valoraciones WHERE tmdb_id = $1 AND tipo = $2`,
    [tmdb_id, tipo]
  );

  // Valoración del usuario actual
  const { rows: propia } = await db.query(
    `SELECT puntuacion FROM valoraciones WHERE usuario_id = $1 AND tmdb_id = $2 AND tipo = $3`,
    [usuario_id, tmdb_id, tipo]
  );

  return {
    mediaUsuarios: media[0].media || null,
    miValoracion: propia[0]?.puntuacion || null,
  };
}

module.exports = {
  crearOActualizarValoracion,
  obtenerValoracionesPorContenido,
  obtenerValoracionDeUsuario,
  eliminarValoracion,
  obtenerResumenValoraciones,
};
