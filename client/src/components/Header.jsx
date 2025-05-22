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
  const token = sessionStorage.getItem("token");
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const nombre = usuario?.nombre || "";
  const [avatar, setAvatar] = useState(
    localStorage.getItem("avatarSeleccionado") ||
      usuario?.avatar ||
      avatarList[0]
  );

  const [showAvatars, setShowAvatars] = useState(false);
  const avatarMenuRef = useRef(null);

  const isActive = (ruta) => location.pathname === ruta;

  useEffect(() => {
    if (["/login", "/register"].includes(location.pathname)) {
      document.body.classList.remove("con-sesion", "sin-sesion");
      return;
    }
    document.body.classList.remove("con-sesion", "sin-sesion");
    document.body.classList.add(token ? "con-sesion" : "sin-sesion");
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
      document.addEventListener("keydown", handleClickOutside); // 👈 escape
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside); // 👈 escape
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    };
  }, [showAvatars]);

  const rutasSinHeader = ["/login", "/register", "/recuperar-password"];
  const esResetPassword = location.pathname.startsWith("/reset-password");

  if (rutasSinHeader.includes(location.pathname) || esResetPassword) {
    return null;
  }

  const handleAvatarSelect = (src) => {
    setAvatar(src);
    setShowAvatars(false);
    localStorage.setItem("avatarSeleccionado", src); // ✅ guardar persistente

    const nuevoUsuario = { ...usuario, avatar: src };
    sessionStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
  };

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
              <img
                src="/favicon.ico"
                alt="CineStash"
                style={{
                  height: "28px", // más pequeño
                  width: "28px", // cuadrado
                  objectFit: "contain", // evita estiramiento
                  filter: "drop-shadow(0 0 1px #1f8df5)", // opcional, toque de luz
                }}
              />

              <span className="cinestash-title m-0">CineStash</span>
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
          )}

          {!token && (
            <div className="w-100 d-flex flex-column align-items-center justify-content-center">
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center gap-2 ">
                  <img
                    src="/favicon.ico"
                    alt="CineStash"
                    style={{
                      height: "28px", // más pequeño
                      width: "28px", // cuadrado
                      objectFit: "contain", // evita estiramiento
                      filter: "drop-shadow(0 0 1px #1f8df5)", // opcional, toque de luz
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
          )}

          {token && (
            <div className="d-flex align-items-center flex-wrap gap-3 justify-content-end">
              <div className="d-flex align-items-center position-relative">
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
                      className="position-absolute bg-dark p-2 rounded border"
                      style={{ top: "40px", zIndex: 1050 }}
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
