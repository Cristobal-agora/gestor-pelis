const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // ahora usa `pg`

async function usuarioExiste(email) {
  const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows.length > 0;
}

async function registrarUsuario(nombre, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)',
    [nombre, email, hashedPassword]
  );
}

async function obtenerUsuarioPorEmail(email) {
  const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
}

function generarToken(usuario) {
  return jwt.sign({ id: usuario.id, nombre: usuario.nombre }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

async function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function obtenerUsuarioPorEmailId(id) {
  const result = await db.query('SELECT nombre, email FROM usuarios WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = {
  usuarioExiste,
  registrarUsuario,
  obtenerUsuarioPorEmail,
  generarToken,
  compararPassword,
  obtenerUsuarioPorEmailId,
};
