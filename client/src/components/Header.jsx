import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nombre = usuario?.nombre || "";

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/register") {
      document.body.classList.remove("con-sesion", "sin-sesion");
      return;
    }
    document.body.classList.remove("con-sesion", "sin-sesion");
    document.body.classList.add(token ? "con-sesion" : "sin-sesion");
  }, [token, location.pathname]);

  if (location.pathname === "/login" || location.pathname === "/register")
    return null;

  return (
    <header
      className="bg-dark border-bottom border-primary shadow-sm fixed-top"
      style={{ zIndex: 1030 }}
    >
      <div className="container-fluid px-3 py-2">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          {/* Logo + título */}
          {token ? (
            <div
              onClick={() => {
                if (location.pathname === "/home") {
                  window.location.reload();
                } else {
                  navigate("/home");
                }
              }}
              className="d-inline-flex align-items-center gap-2 text-decoration-none"
              style={{ cursor: "pointer" }}
            >
              <img
                src="/favicon.ico"
                alt="CineStash"
                style={{ height: "36px" }}
              />
              <span className="cinestash-title">CineStash</span>
            </div>
          ) : (
            <div className="w-100 d-flex justify-content-center">
              <div className="d-inline-flex align-items-center gap-2">
                <img
                  src="/favicon.ico"
                  alt="CineStash"
                  style={{ height: "36px" }}
                />
                <span className="cinestash-title">CineStash</span>
              </div>
            </div>
          )}

          {/* Botones + usuario */}
          {token && (
            <div className="d-flex align-items-center flex-wrap justify-content-center gap-3">
              <span className="text-light d-flex align-items-center gap-1">
                <i
                  className="bi bi-person-fill"
                  style={{ color: "orchid" }}
                ></i>
                <strong>{nombre}</strong>
              </span>
              <Link
                to="/favoritos"
                className="btn btn-outline-primary btn-sm nav-btn-sm"
              >
                ⭐ Favoritos
              </Link>
              <Link
                to="/mis-listas"
                className="btn btn-outline-primary btn-sm nav-btn-sm"
              >
                📂 Mis Listas
              </Link>
              <button
                onClick={cerrarSesion}
                className="btn btn-outline-primary btn-sm cerrar-sesion-btn nav-btn-sm"
              >
                🔓 Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Sin sesión: botones + carrusel */}
        {!token && (
          <>
            <div className="d-flex justify-content-center gap-3 flex-wrap mt-3">
              <Link to="/register" className="btn btn-outline-light">
                Registro
              </Link>
              <Link to="/login" className="btn btn-outline-light">
                Iniciar Sesión
              </Link>
            </div>

            <div
              className="mt-4 px-2"
              style={{ maxWidth: "1200px", margin: "0 auto" }}
            >
              <Carrusel />
            </div>
          </>
        )}
      </div>
    </header>
  );

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  sessionStorage.removeItem("cineStashState");
  window.location.href = "/"; // fuerza reload completo
}


};

export default Header;
