const authService = require('../services/auth.service');
const { RegisterUserDTO, LoginUserDTO } = require('../dtos/user.dto');
const { userToDto } = require('../dtos/userOutput.dto');

exports.register = async (req, res) => {
  const dto = new RegisterUserDTO(req.body);
  const { nombre, email, password } = dto;

  try {
    const existe = await authService.usuarioExiste(email);
    if (existe) {
      return res.status(400).json({ mensaje: 'El email ya está registrado.' });
    }

    await authService.registrarUsuario(nombre, email, password);
    const usuario = await authService.obtenerUsuarioPorEmail(email);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario: userToDto(usuario),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};

exports.login = async (req, res) => {
  const dto = new LoginUserDTO(req.body);
  const { email, password } = dto;

  try {
    const usuario = await authService.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(400).json({ mensaje: 'Email no encontrado.' });
    }

    const match = await authService.compararPassword(password, usuario.password);
    if (!match) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
    }

    const token = authService.generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso.',
      token,
      usuario: userToDto(usuario),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
};
