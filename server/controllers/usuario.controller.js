const authService = require('../services/auth.service');
const { userToDto } = require('../dtos/userOutput.dto');
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Obtener perfil del usuario autenticado
exports.perfil = async (req, res) => {
  try {
    const usuario = await authService.obtenerUsuarioPorEmailId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json(userToDto(usuario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};

// Actualizar nombre y email
exports.actualizarPerfil = async (req, res) => {
  const { nombre, email } = req.body;
  const userId = req.usuario.id;

  try {
    await db.query('UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3', [nombre, email, userId]);
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el perfil' });
  }
};

// Cambiar contraseña
exports.cambiarPassword = async (req, res) => {
  const { passwordActual, nuevaPassword } = req.body;
  const userId = req.usuario.id;

  try {
    const result = await db.query('SELECT password FROM usuarios WHERE id = $1', [userId]);
    const hashAlmacenado = result.rows[0]?.password;

    if (!hashAlmacenado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const coincide = await bcrypt.compare(passwordActual, hashAlmacenado);
    if (!coincide) {
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    const nuevaHash = await bcrypt.hash(nuevaPassword, 10);
    await db.query('UPDATE usuarios SET password = $1 WHERE id = $2', [nuevaHash, userId]);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
  }
};
