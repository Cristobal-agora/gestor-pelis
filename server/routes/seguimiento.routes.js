const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");
const {
  marcarVisto,
  obtenerVistos,
  borrarVisto,
  marcarVariosVistos,
  borrarVariosVistos,
} = require("../controllers/seguimiento.controller");

router.post("/", verificarToken, marcarVisto);
router.get("/tv/:serie_tmdb_id", verificarToken, obtenerVistos); // <- aquí el cambio
router.delete("/", verificarToken, borrarVisto);
router.post("/varios", verificarToken, marcarVariosVistos);
router.delete("/varios", verificarToken, borrarVariosVistos);

module.exports = router;
