const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const usuarioController = require('../controllers/usuario.controller');

router.get('/perfil', verificarToken, usuarioController.perfil);

module.exports = router;
