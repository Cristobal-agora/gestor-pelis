const db = require('../config/db');

exports.crearComentario = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { tmdb_id, tipo, contenido } = req.body;

  try {
    await db.query(
      'INSERT INTO comentarios (usuario_id, tmdb_id, tipo, contenido) VALUES ($1, $2, $3, $4)',
      [usuarioId, tmdb_id, tipo, contenido]
    );
    res.status(201).json({ mensaje: 'Comentario añadido.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear comentario.' });
  }
};

exports.obtenerComentarios = async (req, res) => {
  const { tipo, tmdbId } = req.params;

  try {
    const result = await db.query(
      `SELECT c.*, u.nombre 
       FROM comentarios c 
       JOIN usuarios u ON c.usuario_id = u.id 
       WHERE c.tipo = $1 AND c.tmdb_id = $2 
       ORDER BY c.creado_en DESC`,
      [tipo, tmdbId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener comentarios.' });
  }
};
