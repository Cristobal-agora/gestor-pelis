const express = require("express");
const router = express.Router();
const listasController = require("../controllers/listas.controller");
const verificarToken = require("../middlewares/auth.middleware.js");

// Proteger todas las rutas
router.use(verificarToken);

router.get("/", listasController.obtenerListas);
router.post("/", listasController.crearLista);
router.get("/:id", listasController.obtenerContenidoLista);
router.get('/incluye/:tipo/:id', listasController.listasQueIncluyen);
router.post("/:id/contenido", listasController.agregarContenido);
router.delete("/:id/contenido/:peliculaId", listasController.eliminarContenido);
router.delete('/:id', listasController.eliminarLista);


module.exports = router;
