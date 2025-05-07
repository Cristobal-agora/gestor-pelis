const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ✅ Esto tiene que ir primero

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const db = require('./config/db'); // Conexión a la base de datos
const PORT = process.env.PORT || 5000;
const favoritosRoutes = require('./routes/favoritos.routes');


// Middlewares
const corsOptions = {
  origin: 'https://gestor-pelis.vercel.app', // permite tu frontend en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // si usas cookies o headers personalizados
};

app.use(cors(corsOptions));

app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', authRoutes);
app.use('/api/favoritos', favoritosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando correctamente ✅');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
