const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Comprobar si ya existe el usuario
    const [existe] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario nuevo
    await db.promise().query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [usuarios] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (usuarios.length === 0) {
      return res.status(400).json({ mensaje: 'Email no encontrado.' });
    }

    const usuario = usuarios[0];
    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
    }

    // Crear token JWT
    const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ mensaje: 'Login exitoso.', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
});

module.exports = router;
