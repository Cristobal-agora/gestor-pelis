import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";
import {
  BsPersonFill,
  BsStarFill,
  BsFolderFill,
  BsClockHistory,
  BsGearFill,
  BsBoxArrowRight,
  BsPencilFill,
  BsKeyFill,
} from "react-icons/bs";

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
      className={`shadow-sm fixed-top ${token ? "bg-dark" : ""}`}
      style={{
        zIndex: 1030,
        backgroundColor: "rgba(20, 20, 20, 0.65)",

        backdropFilter: token ? "blur(6px)" : "blur(4px)",
      }}
    >
      <div className={`container-fluid ${!token ? "px-0 py-4" : "px-3 py-2"}`}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          {token && (
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
              <img src="/logo.png" alt="CineStash" style={{ height: "40px" }} />
              <span className="cinestash-title m-0">CineStash</span>
            </div>
          )}

          {!token && (
            <div className="w-100 d-flex flex-column align-items-center justify-content-center">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center gap-2 ">
                  <img
                    src="/logo.png"
                    alt="CineStash"
                    className="logo-img"
                    style={{ height: "40px" }}
                  />
                  <span className="cinestash-title m-0">CineStash</span>
                </div>

                <div className="d-flex gap-3 mt-2">
                  <Link to="/register" className="btn btn-primary px-4">
                    Registro
                  </Link>
                  <Link to="/login" className="btn btn-sin-borde-blanca px-4">
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Área de usuario y navegación */}
          {token && (
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-end">
              <span className="text-light d-flex align-items-center gap-1 me-2">
                <BsPersonFill style={{ color: "orchid" }} />
                <strong>{nombre}</strong>
              </span>
              <Link
                to="/favoritos"
                className={`btn btn-sm text-light ${
                  isActive("/favoritos") ? "fw-bold" : ""
                }`}
              >
                <BsStarFill className="me-1" /> Favoritos
              </Link>
              <Link
                to="/mis-listas"
                className={`btn btn-sm text-light ${
                  isActive("/mis-listas") ? "fw-bold" : ""
                }`}
              >
                <BsFolderFill className="me-1" /> Mis Listas
              </Link>
              <Link
                to="/historial"
                className={`btn btn-sm text-light ${
                  isActive("/historial") ? "fw-bold" : ""
                }`}
              >
                <BsClockHistory className="me-1" /> Historial
              </Link>

              <div className="dropdown">
                <button
                  className={`btn btn-sm text-light dropdown-toggle ${
                    isActive("/perfil/editar") || isActive("/perfil/password")
                      ? "fw-bold"
                      : ""
                  }`}
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <BsGearFill className="me-1" /> Mi cuenta
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/perfil/editar">
                      <BsPencilFill className="me-2" /> Editar perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/perfil/password">
                      <BsKeyFill className="me-2" /> Cambiar contraseña
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={cerrarSesion}
                    >
                      <BsBoxArrowRight className="me-2" /> Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
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
