const authService = require("../services/auth.service");
const { RegisterUserDTO, LoginUserDTO } = require("../dtos/user.dto");
const { userToDto } = require("../dtos/userOutput.dto");
const crypto = require("crypto");
const { enviarEmailRecuperacion } = require("../utils/mailer");

exports.register = async (req, res) => {
  const dto = new RegisterUserDTO(req.body);
  const { nombre, email, password } = dto;

  try {
    const existe = await authService.usuarioExiste(email);
    if (existe) {
      return res.status(400).json({ mensaje: "El email ya está registrado." });
    }

    await authService.registrarUsuario(nombre, email, password);
    const usuario = await authService.obtenerUsuarioPorEmail(email);

    res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: userToDto(usuario),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
};

exports.login = async (req, res) => {
  const dto = new LoginUserDTO(req.body);
  const { email, password } = dto;

  try {
    const usuario = await authService.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(400).json({ mensaje: "Email no encontrado." });
    }

    const match = await authService.compararPassword(
      password,
      usuario.password
    );
    if (!match) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta." });
    }

    const token = authService.generarToken(usuario);

    res.json({
      mensaje: "Login exitoso.",
      token,
      usuario: userToDto(usuario),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
};
exports.recuperarPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await authService.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return res
        .status(404)
        .json({ mensaje: "No hay ninguna cuenta con ese correo." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await authService.guardarTokenRecuperacion(email, token, expiracion);
    await enviarEmailRecuperacion(email, token);

    return res.json({ mensaje: "Correo de recuperación enviado con éxito." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ mensaje: "Error al enviar el correo de recuperación." });
  }
};

exports.restablecerPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  try {
    const usuario = await authService.obtenerUsuarioPorToken(token);

    if (!usuario) {
      return res
        .status(400)
        .json({ mensaje: "Token inválido o expirado." });
    }

    await authService.actualizarPassword(usuario.id, nuevaPassword);
    await authService.eliminarTokenRecuperacion(token);

    res.json({ mensaje: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al restablecer la contraseña." });
  }
};
