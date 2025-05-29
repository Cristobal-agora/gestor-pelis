import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Footer.css";

const Footer = ({ modo = "completo", className = "" }) => {
  const token = sessionStorage.getItem("token");
  const year = new Date().getFullYear();
  const location = useLocation();

  const esSimple = modo === "simple";

  return (
    <footer className={`footer mt-5 border-top pt-4 pb-2 ${className}`}>
      <div className="container text-center">
        {esSimple ? (
          <div className="d-flex flex-column align-items-center gap-2 logo-container">
            <img
              src="/favicon.ico"
              alt="CineStash Logo"
              style={{ width: "28px", height: "28px" }}
            />
            <span className="logo">CineStash</span>
            <p className="text-muted small mb-0">© {year} CineStash</p>
          </div>
        ) : (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-center text-md-start gap-4">
            {/* Marca / Logo */}
            <div className="d-flex align-items-center gap-2 logo-container">
              <img
                src="/favicon.ico"
                alt="CineStash Logo"
                style={{ width: "28px", height: "28px" }}
              />
              <span className="logo">CineStash</span>
              <p className="slogan w-100 mt-2">
                Tu espacio para gestionar y descubrir películas y series.
              </p>
            </div>

            {/* Enlaces */}
            {token && (
              <ul className="footer-links list-unstyled d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-0">
                <li>
                  <Link
                    to="/home"
                    onClick={(e) => {
                      if (
                        location.pathname === "/home" ||
                        location.pathname === "/"
                      ) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    Inicio
                  </Link>
                </li>

                <li>
                  <Link to="/favoritos">Favoritos</Link>
                </li>
                <li>
                  <Link to="/mis-listas">Mis listas</Link>
                </li>
                <li>
                  <Link to="/historial">Historial</Link>
                </li>
              </ul>
            )}

            {/* Redes sociales */}
            <div className="text-center text-md-end">
              <div className="social-icons mb-2">
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <i className="bi bi-twitter"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <i className="bi bi-github"></i>
                </a>
              </div>
              <p className="text-muted small mb-0">© {year} CineStash</p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
