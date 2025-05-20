const express = require("express");
const router = express.Router();
const listasController = require("../controllers/listas.controller");
const verificarToken = require("../middlewares/auth.middleware.js");

router.use(verificarToken);

router.get("/", listasController.obtenerListas);
router.post("/", listasController.crearLista);
router.get("/:id", listasController.obtenerContenidoLista);
router.get("/incluye/:tipo/:id", listasController.listasQueIncluyen);
router.post("/:id/contenido", listasController.agregarContenido);
router.delete("/:id/contenido/:peliculaId", listasController.eliminarContenido);
router.delete("/:id", listasController.eliminarLista);

// NUEVA RUTA PARA OBTENER EL NOMBRE
router.get('/:id/detalle', async (req, res) => {
  const db = require('../config/db');
  const { id } = req.params;
  const usuarioId = req.usuario.id;

  try {
    const result = await db.query(
      'SELECT nombre FROM listas WHERE id = $1 AND usuario_id = $2',
      [id, usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json({ nombre: result.rows[0].nombre });
  } catch (error) {
    console.error('Error al obtener nombre de la lista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
