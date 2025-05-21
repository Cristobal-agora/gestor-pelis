const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function usuarioExiste(email) {
  const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0;
}

async function registrarUsuario(nombre, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)",
    [nombre, email, hashedPassword]
  );
}

async function obtenerUsuarioPorEmail(email) {
  const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
}

async function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function obtenerUsuarioPorEmailId(id) {
  const result = await db.query(
    "SELECT nombre, email FROM usuarios WHERE id = $1",
    [id]
  );
  return result.rows[0];
}
async function guardarTokenRecuperacion(email, token, expiracion) {
  await db.query(
    `UPDATE usuarios 
     SET token_recuperacion = $1, token_expiracion = $2 
     WHERE email = $3`,
    [token, expiracion, email]
  );
}

async function obtenerUsuarioPorToken(token) {
  const result = await db.query(
    `SELECT * FROM usuarios 
     WHERE token_recuperacion = $1 AND token_expiracion > NOW()`,
    [token]
  );
  return result.rows[0];
}

async function actualizarPassword(id, nuevaPassword) {
  const hashed = await bcrypt.hash(nuevaPassword, 10);
  await db.query(
    `UPDATE usuarios 
     SET password = $1 
     WHERE id = $2`,
    [hashed, id]
  );
}

async function eliminarTokenRecuperacion(token) {
  await db.query(
    `UPDATE usuarios 
     SET token_recuperacion = NULL, token_expiracion = NULL 
     WHERE token_recuperacion = $1`,
    [token]
  );
}

module.exports = {
  usuarioExiste,
  registrarUsuario,
  obtenerUsuarioPorEmail,
  generarToken,
  compararPassword,
  obtenerUsuarioPorEmailId,
  guardarTokenRecuperacion,
  obtenerUsuarioPorToken, // ✅ nuevo
  actualizarPassword, // ✅ nuevo
  eliminarTokenRecuperacion,
};
