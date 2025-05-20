const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const usuarioController = require('../controllers/usuario.controller');
const {
  validateUpdateProfile,
  validateChangePassword,
} = require('../validators/user.validator');
const validateRequest = require('../middlewares/validation.middleware');

// Obtener perfil
router.get('/perfil', verificarToken, usuarioController.perfil);

// Actualizar nombre/email
router.put('/perfil', verificarToken, validateUpdateProfile, validateRequest, usuarioController.actualizarPerfil);

// Cambiar contraseña
router.put('/password', verificarToken, validateChangePassword, validateRequest, usuarioController.cambiarPassword);

module.exports = router;
