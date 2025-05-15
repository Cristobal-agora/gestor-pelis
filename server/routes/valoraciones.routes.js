const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const valoracionesService = require("../services/valoraciones.service");

// POST → Crear o actualizar valoración
router.post("/", requireAuth, async (req, res) => {
  const { tmdb_id, tipo, puntuacion } = req.body;
  const usuario_id = req.usuario.id;

  try {
    await valoracionesService.crearOActualizarValoracion(usuario_id, tmdb_id, tipo, puntuacion);
    res.status(200).json({ mensaje: "Valoración guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar valoración:", error);
    res.status(500).json({ mensaje: "Error al guardar valoración" });
  }
});

// GET → Obtener todas las valoraciones de un contenido
router.get("/:tipo/:tmdb_id", async (req, res) => {
  const { tipo, tmdb_id } = req.params;

  try {
    const valoraciones = await valoracionesService.obtenerValoracionesPorContenido(tmdb_id, tipo);
    res.json(valoraciones);
  } catch (error) {
    console.error("Error al obtener valoraciones:", error);
    res.status(500).json({ mensaje: "Error al obtener valoraciones" });
  }
});

// GET → Obtener valoración del usuario actual
router.get("/:tipo/:tmdb_id/mia", requireAuth, async (req, res) => {
  const { tipo, tmdb_id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    const valoracion = await valoracionesService.obtenerValoracionDeUsuario(usuario_id, tmdb_id, tipo);
    res.json(valoracion || null);
  } catch (error) {
    console.error("Error al obtener valoración del usuario:", error);
    res.status(500).json({ mensaje: "Error al obtener valoración del usuario" });
  }
});

// DELETE → Eliminar valoración
router.delete("/:tipo/:tmdb_id", requireAuth, async (req, res) => {
  const { tipo, tmdb_id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    await valoracionesService.eliminarValoracion(usuario_id, tmdb_id, tipo);
    res.json({ mensaje: "Valoración eliminada" });
  } catch (error) {
    console.error("Error al eliminar valoración:", error);
    res.status(500).json({ mensaje: "Error al eliminar valoración" });
  }
});

// GET → Obtener media general + valoración del usuario
router.get("/resumen/:tipo/:tmdb_id", requireAuth, async (req, res) => {
  const { tipo, tmdb_id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    const resumen = await valoracionesService.obtenerResumenValoraciones(usuario_id, tmdb_id, tipo);
    res.json(resumen);
  } catch (error) {
    console.error("Error al obtener resumen de valoraciones:", error);
    res.status(500).json({ mensaje: "Error al obtener resumen" });
  }
});


module.exports = router;
