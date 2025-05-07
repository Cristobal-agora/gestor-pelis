const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  // Soporta formatos tipo: "Bearer <token>"
  const tokenLimpio = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  try {
    const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    req.usuario = decoded; // Lo puedes usar en controladores (por ejemplo, req.usuario.id)
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
}

module.exports = verificarToken;
