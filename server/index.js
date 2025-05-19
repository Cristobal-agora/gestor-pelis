const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express(); // ✅ Esto tiene que ir primero
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const db = require("./config/db"); // Conexión a la base de datos
const PORT = process.env.PORT || 5000;
const favoritosRoutes = require("./routes/favoritos.routes");
const listasRoutes = require("./routes/listas.routes");
const valoracionesRoutes = require("./routes/valoraciones.routes");
const seguimientoRoutes = require("./routes/seguimiento.routes");
const comentariosRoutes = require('./routes/comentarios.routes');
const historialRoutes = require('./routes/historial.routes');

// Middlewares
const corsOptions = {
  origin: ["http://localhost:5173", "https://gestor-pelis.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api", authRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/listas", listasRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api/seguimiento", seguimientoRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/historial', historialRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Error inesperado:", err.stack);
  res.status(500).send("Error interno en el servidor");
});


// Ruta de prueba
app.get("/", (req, res) => {
  console.log("✅ Se ha accedido a la ruta /");
  res.status(200).send("Servidor backend funcionando correctamente ✅");
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
