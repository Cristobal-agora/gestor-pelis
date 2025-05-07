const db = require('../config/db');

exports.agregarFavorito = async (req, res) => {
  const idUsuario = req.usuario.id;
  const { id_pelicula } = req.body;

  try {
    await db.query(
      'INSERT INTO favoritos (id_usuario, id_pelicula) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [idUsuario, id_pelicula]
    );
    res.status(201).json({ mensaje: 'Película añadida a favoritos.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al añadir a favoritos.' });
  }
};

exports.obtenerFavoritos = async (req, res) => {
  const idUsuario = req.usuario.id;

  try {
    const result = await db.query(
      'SELECT id_pelicula FROM favoritos WHERE id_usuario = $1',
      [idUsuario]
    );
    res.json(result.rows.map(row => row.id_pelicula));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener favoritos.' });
  }
};

exports.eliminarFavorito = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idPelicula = req.params.idPelicula;

  try {
    await db.query(
      'DELETE FROM favoritos WHERE id_usuario = $1 AND id_pelicula = $2',
      [idUsuario, idPelicula]
    );
    res.json({ mensaje: 'Película eliminada de favoritos.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar favorito.' });
  }
};
