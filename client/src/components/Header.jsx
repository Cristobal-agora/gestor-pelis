import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BsFolderFill,
  BsClockHistory,
  BsGearFill,
  BsBoxArrowRight,
  BsPencilFill,
  BsKeyFill,
} from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

const avatarList = [
  "/avatars/1.png",
  "/avatars/2.png",
  "/avatars/3.png",
  "/avatars/4.png",
  "/avatars/5.png",
  "/avatars/6.png",
  "/avatars/7.png",
  "/avatars/8.png",
  "/avatars/9.png",
  "/avatars/10.png",
];

const Header = ({ modoClaro, cambiarTema }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(sessionStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const nombre = usuario?.nombre || "";
  const [avatar, setAvatar] = useState(
    localStorage.getItem("avatarSeleccionado") ||
      usuario?.avatar ||
      avatarList[0]
  );

  const [showAvatars, setShowAvatars] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  const avatarMenuRef = useRef(null);

  const isActive = (ruta) => location.pathname === ruta;

  useEffect(() => {
    const rutasSinSesion = ["/", "/login", "/register", "/recuperar-password"];
    const estaEnReset = location.pathname.startsWith("/reset-password");

    document.body.classList.remove("con-sesion", "sin-sesion");

    if (rutasSinSesion.includes(location.pathname) || estaEnReset || !token) {
      document.body.classList.add("sin-sesion");
    } else {
      document.body.classList.add("con-sesion");
    }
  }, [token, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatars(false);
      }
      if (e.key === "Escape") {
        setShowAvatars(false);
      }
    };

    if (showAvatars) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    };
  }, [showAvatars]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuAbierto]);

  useEffect(() => {
    if (!token) {
      window.scrollTo(0, 0);
    }
  }, [token]);

  const rutasSinHeader = ["/login", "/register", "/recuperar-password"];
  const esResetPassword = location.pathname.startsWith("/reset-password");

  if (rutasSinHeader.includes(location.pathname) || esResetPassword) {
    return null;
  }

  const handleAvatarSelect = (src) => {
    setAvatar(src);
    setShowAvatars(false);
    localStorage.setItem("avatarSeleccionado", src);

    const nuevoUsuario = { ...usuario, avatar: src };
    sessionStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("cineStashState");
    window.location.href = "/";
  };
  const cerrarMenu = () => setMenuAbierto(false);

  // 👉 Header SIN sesión
  if (!token) {
    return (
      <header
        className="shadow-sm header-sin-sesion"
        style={{ position: "relative", zIndex: 1030 }}
      >
        <div className="container px-0 pb-2">
          <div className="w-100 d-flex flex-column align-items-center justify-content-center">
            <div className="d-flex flex-column align-items-center">
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/favicon.ico"
                  alt="CineStash"
                  style={{
                    height: "28px",
                    width: "28px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 1px #1f8df5)",
                  }}
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
        </div>
      </header>
    );
  }

  // 👉 Header CON sesión
  return (
    <header
      className="shadow-sm fixed-top bg-dark"
      style={{
        zIndex: 1030,
        backgroundColor: "rgba(20, 20, 20, 0.65)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="container px-3 py-2">
        <div className="row align-items-center">
          {/* IZQUIERDA: Logo + modo claro */}
          <div className="col d-flex align-items-center gap-2">
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
              <img
                src="/favicon.ico"
                alt="CineStash"
                style={{
                  height: "28px",
                  width: "28px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 1px #1f8df5)",
                }}
              />
              <span className="cinestash-title text-azul-suave m-0">
                CineStash
              </span>
            </div>

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cambiarTema();
              }}
              title={`Cambiar a modo ${modoClaro ? "oscuro" : "claro"}`}
              className="btn btn-sm sin-borde-icono"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9, rotate: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {modoClaro ? <FiMoon size={20} /> : <FiSun size={20} />}
            </motion.button>
          </div>

          {/* BOTÓN HAMBURGUESA A LA DERECHA en móvil */}
          <div className="col-auto d-md-none ms-auto">
            <motion.button
              className="btn sin-borde-icono"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAbierto((prev) => !prev);
              }}
              title="Menú"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              ☰
            </motion.button>
          </div>

          {/* NAVEGACIÓN EN ESCRITORIO (VISIBLE DE MD EN ADELANTE) */}
          <div className="col-auto d-none d-md-flex align-items-center gap-3">
            <div className="position-relative d-flex align-items-center">
              <img
                src={avatar}
                alt="avatar"
                style={{
                  height: "32px",
                  width: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                onClick={() => setShowAvatars(!showAvatars)}
              />
              <strong className="text-light ms-2">{nombre}</strong>

              <AnimatePresence>
                {showAvatars && (
                  <motion.div
                    ref={avatarMenuRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="avatar-selector position-absolute bg-dark p-2 rounded border"
                    style={{
                      top: "40px",
                      left: 0,
                      zIndex: 1050,
                    }}
                  >
                    <div
                      className="d-grid gap-2"
                      style={{
                        gridTemplateColumns: "repeat(2, 1fr)",
                        justifyItems: "center",
                      }}
                    >
                      {avatarList.map((src, index) => (
                        <motion.img
                          key={index}
                          src={src}
                          alt={`avatar-${index}`}
                          initial={false}
                          animate={{
                            border:
                              src === avatar
                                ? "2px solid #1f8df5"
                                : "2px solid transparent",
                            boxShadow:
                              src === avatar ? "0 0 6px #1f8df5" : "none",
                            scale: src === avatar ? 1.1 : 1,
                          }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                          onClick={() => handleAvatarSelect(src)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/favoritos"
              className={`btn btn-sm text-light ${
                isActive("/favoritos") ? "fw-bold" : ""
              }`}
            >
              <FaHeart className="me-1" /> Favoritos
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
        </div>
        {/* MENÚ HAMBURGUESA (SOLO EN MÓVIL) */}
        <div
          ref={menuRef}
          className={`menu-hamburguesa-content position-absolute end-0 mt-2 bg-dark p-3 rounded border shadow ${
            menuAbierto ? "d-flex d-md-none" : "d-none"
          } flex-column gap-3`}
          style={{ top: "100%", zIndex: 1050, minWidth: "220px" }}
        >
          <div className="d-flex align-items-center position-relative flex-wrap">
            <img
              src={avatar}
              alt="avatar"
              style={{
                height: "32px",
                width: "32px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              onClick={() => setShowAvatars(!showAvatars)}
            />
            <strong className="ms-2 text-light">{nombre}</strong>

            <AnimatePresence>
              {showAvatars && (
                <motion.div
                  ref={avatarMenuRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="avatar-selector position-absolute bg-dark p-2 rounded border"
                  style={{ top: "40px", right: 0, zIndex: 1050 }}
                >
                  <div
                    className="d-grid gap-2"
                    style={{
                      gridTemplateColumns: "repeat(2, 1fr)",
                      justifyItems: "center",
                    }}
                  >
                    {avatarList.map((src, index) => (
                      <motion.img
                        key={index}
                        src={src}
                        alt={`avatar-${index}`}
                        initial={false}
                        animate={{
                          border:
                            src === avatar
                              ? "2px solid #1f8df5"
                              : "2px solid transparent",
                          boxShadow:
                            src === avatar ? "0 0 6px #1f8df5" : "none",
                          scale: src === avatar ? 1.1 : 1,
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                        onClick={() => handleAvatarSelect(src)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/favoritos"
            onClick={cerrarMenu}
            className={`btn btn-sm text-light ${
              isActive("/favoritos") ? "fw-bold" : ""
            }`}
          >
            <FaHeart className="me-1" /> Favoritos
          </Link>
          <Link
            to="/mis-listas"
            onClick={cerrarMenu}
            className={`btn btn-sm text-light ${
              isActive("/mis-listas") ? "fw-bold" : ""
            }`}
          >
            <BsFolderFill className="me-1" /> Mis Listas
          </Link>
          <Link
            to="/historial"
            onClick={cerrarMenu}
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
                <Link
                  className="dropdown-item"
                  to="/perfil/editar"
                  onClick={cerrarMenu}
                >
                  <BsPencilFill className="me-2" /> Editar perfil
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item"
                  to="/perfil/password"
                  onClick={cerrarMenu}
                >
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
      </div>
    </header>
  );
};

export default Header;
