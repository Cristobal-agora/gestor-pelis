const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth.middleware");
const historialController = require("../controllers/historial.controller");

router.post("/", verificarToken, historialController.marcarVista);
router.delete(
  "/:tmdbId/:tipo",
  verificarToken,
  historialController.desmarcarVista
);
router.get("/", verificarToken, historialController.obtenerHistorial);

module.exports = router;
