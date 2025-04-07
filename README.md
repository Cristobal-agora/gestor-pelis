# Gestor de Películas y Series 🎬

Este proyecto es una aplicación web full-stack para gestionar, valorar y descubrir películas y series. Incluye autenticación con JWT, conexión con la API de TMDb, y una interfaz moderna y temática inspirada en el cine.

## 🛠 Tecnologías Utilizadas

### Frontend
- React
- Bootstrap 5
- Axios
- HTML5 + CSS3

### Backend
- Node.js
- Express.js
- JWT (Json Web Token)
- Bcrypt

### Base de Datos
- MySQL

## 🚀 Funcionalidades Principales

- Registro e inicio de sesión seguro con JWT
- Búsqueda de películas y series mediante la API de TMDb (futuro)
- Carrusel visual con temática cinematográfica (pendiente de mejora)
- Valoración, comentarios, listas personalizadas y favoritos (en desarrollo)
- Sistema de etiquetas propias
- Visualización de contenido público de otros usuarios

## 🔐 Seguridad

- Contraseñas cifradas con bcrypt
- Validaciones en frontend y backend
- Autenticación con JWT
- Protección de rutas privadas

## 🧩 Estructura del Proyecto

```
/client        → Frontend en React
/server        → Backend en Node.js + Express
/db            → Scripts y estructura de base de datos
```

## 🖥 Instrucciones de Uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Cristobal-agora/gestor-pelis.git
cd gestor-pelis
```

### 2. Configurar el backend

```bash
cd server
npm install
# Crea un archivo .env con los datos de conexión a MySQL y JWT_SECRET
npm run dev
```

### 3. Configurar el frontend

```bash
cd ../client
npm install
npm run dev
```

## 📁 Estructura Actual (Primera entrega)

- Proyecto dividido en frontend y backend
- Registro e inicio de sesión funcional
- Diseño visual con cabecera personalizada y carrusel
- Proyecto subido a GitHub

---

🧠 Autor: Cristóbal  
📅 Estado actual: Primera entrega completada (8 de abril)
