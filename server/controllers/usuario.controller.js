const authService = require('../services/auth.service');

exports.perfil = async (req, res) => {
  try {
    const usuario = await authService.obtenerUsuarioPorEmailId(req.usuario.id); // función nueva abajo
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Solo devolver nombre y email (no password)
    const { userToDto } = require('../dtos/userOutput.dto');
res.json(userToDto(usuario));

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};
