const db = require("../config/db");

exports.obtenerListas = async (req, res) => {
  try {
    const { id: usuario_id } = req.usuario;

    const result = await db.query(
      "SELECT * FROM listas WHERE usuario_id = $1",
      [usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en obtenerListas:", err);
    res.status(500).json({ mensaje: "Error al obtener las listas" });
  }
};

exports.crearLista = async (req, res) => {
  try {
    const { id: usuario_id } = req.usuario;
    const { nombre } = req.body;

    console.log("🧪 crearLista →", { usuario_id, nombre });

    if (!usuario_id) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    if (!nombre) {
      return res.status(400).json({ mensaje: "Falta el nombre" });
    }

    const nuevaLista = await db.query(
      "INSERT INTO listas (nombre, usuario_id) VALUES ($1, $2) RETURNING id, nombre",
      [nombre, usuario_id]
    );

    res.json(nuevaLista.rows[0]);
  } catch (err) {
    console.error("❌ Error en crearLista:", err);
    res.status(500).json({ mensaje: "Error al crear la lista" });
  }
};


exports.obtenerContenidoLista = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM listas_contenido WHERE lista_id = $1",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en obtenerContenidoLista:", err);
    res.status(500).json({ mensaje: "Error al obtener contenido" });
  }
};

exports.agregarContenido = async (req, res) => {
  try {
    const { id: lista_id } = req.params;
    const { pelicula_id, tipo } = req.body;

    if (!pelicula_id || !tipo) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    const existe = await db.query(
      "SELECT 1 FROM listas_contenido WHERE lista_id = $1 AND pelicula_id = $2",
      [lista_id, pelicula_id]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({ mensaje: "Ya está en la lista" });
    }

    await db.query(
      "INSERT INTO listas_contenido (lista_id, tipo, pelicula_id) VALUES ($1, $2, $3)",
      [lista_id, tipo, pelicula_id]
    );

    res.json({ mensaje: "Contenido añadido a la lista" });
  } catch (err) {
    console.error("❌ Error en agregarContenido:", err);
    res.status(500).json({ mensaje: "Error al añadir contenido" });
  }
};

exports.eliminarContenido = async (req, res) => {
  try {
    const { id: lista_id, peliculaId } = req.params;

    await db.query(
      "DELETE FROM listas_contenido WHERE lista_id = $1 AND pelicula_id = $2",
      [lista_id, peliculaId]
    );

    res.json({ mensaje: "Contenido eliminado de la lista" });
  } catch (err) {
    console.error("❌ Error en eliminarContenido:", err);
    res.status(500).json({ mensaje: "Error al eliminar contenido" });
  }
};

exports.eliminarLista = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: usuario_id } = req.usuario;

    // Primero elimina el contenido relacionado
    await db.query("DELETE FROM listas_contenido WHERE lista_id = $1", [id]);

    // Luego elimina la lista si pertenece al usuario
    const result = await db.query(
      "DELETE FROM listas WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ mensaje: "Lista no encontrada o no autorizada" });
    }

    res.json({ mensaje: "Lista eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar lista:", err);
    res.status(500).json({ mensaje: "Error al eliminar la lista" });
  }
};

exports.listasQueIncluyen = async (req, res) => {
  const { tipo, id: pelicula_id } = req.params;
  const { id: usuario_id } = req.usuario;

  try {
    const result = await db.query(
      `SELECT l.id, l.nombre FROM listas l
       JOIN listas_contenido lc ON l.id = lc.lista_id
       WHERE lc.tipo = $1 AND lc.pelicula_id = $2 AND l.usuario_id = $3`,
      [tipo, pelicula_id, usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en listasQueIncluyen:", err);
    res.status(500).json({ mensaje: "Error al buscar listas" });
  }
};
