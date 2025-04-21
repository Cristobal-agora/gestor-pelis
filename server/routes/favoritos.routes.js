const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const favoritosController = require('../controllers/favoritos.controller');

// Añadir a favoritos
router.post('/', verificarToken, favoritosController.agregarFavorito);

// Obtener favoritos del usuario
router.get('/', verificarToken, favoritosController.obtenerFavoritos);

// Eliminar de favoritos
router.delete('/:idPelicula', verificarToken, favoritosController.eliminarFavorito);

module.exports = router;
