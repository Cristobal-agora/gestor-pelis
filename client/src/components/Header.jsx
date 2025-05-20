import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const nombre = usuario?.nombre || "";
  const isActive = (ruta) => location.pathname === ruta;
  

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      document.body.classList.remove("con-sesion", "sin-sesion");
      return;
    }
    document.body.classList.remove("con-sesion", "sin-sesion");
    document.body.classList.add(token ? "con-sesion" : "sin-sesion");
  }, [token, location.pathname]);

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <header
      className="bg-dark border-bottom border-primary shadow-sm fixed-top"
      style={{ zIndex: 1030 }}
    >
      <div className="container-fluid px-3 py-2">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          {/* Logo y título */}
          {token ? (
            // Logo clicable con sesión
            <div
              onClick={() => {
                sessionStorage.removeItem("cineStashState");
                location.pathname === "/home"
                  ? window.location.reload()
                  : navigate("/home");
              }}
              className="d-flex align-items-center gap-2 text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <img src="/logo.png" alt="CineStash" style={{ height: "36px" }} />
              <span className="cinestash-title m-0">CineStash</span>
            </div>
          ) : (
            // Logo centrado sin sesión, sin cursor de puntero
            <div className="w-100 d-flex justify-content-center">
              <div
                className="d-inline-flex align-items-center gap-2"
                style={{ cursor: "default" }}
              >
                <img
                  src="/logo.png"
                  alt="CineStash"
                  style={{ height: "36px" }}
                />
                <span className="cinestash-title m-0">CineStash</span>
              </div>
            </div>
          )}

          {/* Área de usuario y navegación */}
          {token && (
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-end">
              <span className="text-light d-flex align-items-center gap-1 me-2">
                <i
                  className="bi bi-person-fill"
                  style={{ color: "orchid" }}
                ></i>
                <strong>{nombre}</strong>
              </span>
              <Link
                to="/favoritos"
                className={`btn btn-outline-primary btn-sm ${
                  isActive("/favoritos") ? "active" : ""
                }`}
              >
                ⭐ Favoritos
              </Link>

              <Link
                to="/mis-listas"
                className={`btn btn-outline-primary btn-sm ${
                  isActive("/mis-listas") ? "active" : ""
                }`}
              >
                📂 Mis Listas
              </Link>

              <Link
                to="/historial"
                className={`btn btn-outline-primary btn-sm ${
                  isActive("/historial") ? "active" : ""
                }`}
              >
                🕒 Historial
              </Link>

              <div className="dropdown">
                <button
                className={`btn btn-outline-primary btn-sm dropdown-toggle ${
  isActive("/perfil/editar") || isActive("/perfil/password") ? "active" : ""
}`}

                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  ⚙️ Mi cuenta
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/perfil/editar">
                      📝 Editar perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/perfil/password">
                      🔑 Cambiar contraseña
                    </Link>
                  </li>
                </ul>
              </div>
              <button
                onClick={cerrarSesion}
                className="btn btn-outline-primary btn-sm cerrar-sesion-btn"
              >
                🔓 Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Si no hay sesión: Botones */}
        {!token && (
          <div className="d-flex justify-content-center gap-3 flex-wrap mt-3">
            <Link to="/register" className="btn btn-outline-light">
              Registro
            </Link>
            <Link to="/login" className="btn btn-outline-light">
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </header>
  );

  function cerrarSesion() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("cineStashState");
    window.location.href = "/";
  }
};

export default Header;
