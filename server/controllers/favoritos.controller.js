const db = require("../config/db");

exports.agregarFavorito = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { pelicula_id, titulo, poster, tipo } = req.body;

  try {
    await db.query(
      "INSERT INTO favoritos (usuario_id, pelicula_id, titulo, poster, tipo) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
      [usuarioId, pelicula_id, titulo, poster, tipo]
    );
    res.status(201).json({ mensaje: "Añadido a favoritos." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al añadir a favoritos." });
  }
};

exports.obtenerFavoritos = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const result = await db.query(
      "SELECT pelicula_id, tipo FROM favoritos WHERE usuario_id = $1",
      [usuarioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener favoritos." });
  }
};

exports.eliminarFavorito = async (req, res) => {
  const usuarioId = req.usuario.id;
  const peliculaId = req.params.idPelicula;

  try {
    await db.query(
      "DELETE FROM favoritos WHERE usuario_id = $1 AND pelicula_id = $2",
      [usuarioId, peliculaId]
    );
    res.json({ mensaje: "Película eliminada de favoritos." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al eliminar favorito." });
  }
};
