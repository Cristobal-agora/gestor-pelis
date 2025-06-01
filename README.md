# CineStash 🎬

CineStash es una aplicación web full-stack moderna y visualmente atractiva que permite gestionar, descubrir, valorar y seguir películas y series. Integra autenticación segura con JWT, conexión con la API de TMDb, comentarios, favoritos, listas personalizadas, historial y mucho más.

## 🛠 Tecnologías Utilizadas

### Frontend

- React + Vite
- Bootstrap 5
- Axios
- React Router DOM
- React Toastify
- Framer Motion
- React Icons

### Backend

- Node.js
- Express.js
- PostgreSQL (Railway)
- JWT (Json Web Token)
- Bcrypt
- DTOs (Data Transfer Objects)

### API Externa

- [TMDb API](https://www.themoviedb.org/documentation/api) para películas, series y metadatos

## 🚀 Funcionalidades Finales

- ✅ Registro e inicio de sesión con autenticación JWT
- ✅ Recuperación y restablecimiento de contraseña por email
- ✅ Visualización y búsqueda de películas y series
- ✅ Marcado de películas como vistas (historial)
- ✅ Seguimiento de series y episodios vistos
- ✅ Comentarios y valoraciones propias
- ✅ Gestión de favoritos
- ✅ Creación de listas personalizadas con películas y series
- ✅ Plataforma responsive con modo claro/oscuro
- ✅ Selector de avatar personalizado
- ✅ Chatbot IA integrado con GPT-4o
- ✅ Información de plataformas donde ver el contenido
- ✅ Estilo inspirado en JustWatch

## 🔐 Seguridad

- Contraseñas cifradas con bcrypt
- Validaciones robustas en frontend y backend
- Autenticación segura con JWT (protegida en rutas y peticiones)
- Protección de rutas con tokens y control de acceso

## 🌐 Despliegue

- **Frontend** desplegado en [Vercel](https://vercel.com)
- **Backend** desplegado en [Railway](https://railway.app)
- Variables de entorno gestionadas con `.env` y `import.meta.env`

## 🧩 Estructura del Proyecto

```
/client        → Frontend en React
/server        → Backend en Node.js + Express
```

## 📦 Instrucciones de Uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Cristobal-agora/gestor-pelis.git
cd gestor-pelis
```

### 2. Configurar el backend

```bash
cd server
npm install
# Crear archivo .env con las siguientes variables:
# JWT_SECRET=
# DATABASE_URL=postgresql://...
npm run dev
```

### 3. Configurar el frontend

```bash
cd ../client
npm install
# Crear archivo .env con la variable:
# VITE_API_URL=https://tu-api-backend.railway.app
npm run dev
```

## 📸 Capturas y Manual de Usuario

Incluye animaciones, vistas responsivas y experiencia personalizada. Puedes consultar el manual de usuario en la carpeta de documentación (no incluido aquí).

## 📅 Estado del Proyecto

✔️ Proyecto finalizado — tercera entrega completa  
📁 Entregado como parte del TFG de Desarrollo de Aplicaciones Web (2025)

---

👨‍💻 Autor: Cristóbal Muñoz Granado
🎓 Proyecto final de DAW — IES Agora
