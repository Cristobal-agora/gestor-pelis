const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);


// Conexión a la base de datos
const db = require('./db');

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando correctamente ✅');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
