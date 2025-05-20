const db = require("../config/db");
const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");
const comentariosController = require("../controllers/comentarios.controller");

router.post("/", verificarToken, comentariosController.crearComentario);
router.get("/:tipo/:tmdbId", comentariosController.obtenerComentarios);
// DELETE /api/comentarios/:id
router.delete("/:id", verificarToken, async (req, res) => {
  const comentarioId = req.params.id;
  const usuarioId = req.usuario.id;

  const resultado = await db.query(
    "DELETE FROM comentarios WHERE id = $1 AND usuario_id = $2 RETURNING *",
    [comentarioId, usuarioId]
  );

  if (resultado.rowCount === 0) {
    return res
      .status(403)
      .json({ error: "No autorizado para borrar este comentario" });
  }

  res.json({ mensaje: "Comentario borrado" });
});

module.exports = router;
