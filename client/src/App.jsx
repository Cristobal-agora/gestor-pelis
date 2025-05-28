import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Header from "./components/Header";
import Home from "./pages/Home";
import PopularMovies from "./pages/PopularMovies";
import MovieDetail from "./pages/MovieDetail";
import Favoritos from "./pages/Favoritos";
import SerieDetail from "./pages/SerieDetail";
import { useEffect, useState } from "react";
import MisListas from "./pages/MisListas";
import ListaDetalle from "./pages/ListaDetalle";
import Historial from "./components/Historial";
import Footer from "./components/Footer"; // asegúrate de que la ruta sea correcta
import Inicio from "./pages/Inicio";
import EditarPerfil from "./components/EditarPerfil";
import CambiarPassword from "./components/CambiarPassword";
import ChatbotIA from "./components/ChatbotIA";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RutaPrivada from "./components/RutaPrivada";
import RecuperarPassword from "./pages/RecuperarPassword";
import ResetPassword from "./pages/ResetPassword";
import { toast } from "react-toastify";
import Buscar from "./components/Buscar";
import RedireccionRutaDesconocida from "./components/RedireccionRutaDesconocida";
import Director from "./pages/Director";
function AppContent() {
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  const mostrarChatbot =
    token && !["/login", "/register", "/"].includes(location.pathname);

  // 👇 Estado para modo claro
  const [modoClaro, setModoClaro] = useState(() => {
    const guardado = localStorage.getItem("modo");
    return guardado ? guardado === "claro" : false; // oscuro por defecto
  });
  const [temaInicializado, setTemaInicializado] = useState(false);

  // 👇 Aplicar clase al body según modo
  useEffect(() => {
    const clase = modoClaro ? "modo-claro" : "modo-oscuro";
    document.body.classList.remove("modo-claro", "modo-oscuro");
    document.body.classList.add(clase);
    localStorage.setItem("modo", modoClaro ? "claro" : "oscuro");

    if (!temaInicializado) {
      setTemaInicializado(true);
    }
  }, [modoClaro, temaInicializado, location.pathname]);

  const rutasSinHeaderFooter = ["/login", "/register", "/reset-password"];
  const rutaOcultaFooter = rutasSinHeaderFooter.some((ruta) =>
    location.pathname.startsWith(ruta)
  );

  const mostrarFooterSimple = location.pathname === "/";

  useEffect(() => {
    const rutaActual = location.pathname;
    const sinSesion =
      ["/login", "/register", "/recuperar-password"].some((ruta) =>
        rutaActual.startsWith(ruta)
      ) || !sessionStorage.getItem("token");

    document.body.classList.remove("con-sesion", "sin-sesion");
    document.body.classList.add(sinSesion ? "sin-sesion" : "con-sesion");
  }, [location.pathname]);

  const cambiarTema = () => {
    setModoClaro((prev) => {
      const nuevo = !prev;

      // Mostrar toast manual SIEMPRE cuando el usuario lo activa
      toast.info(`Modo ${nuevo ? "claro" : "oscuro"} activado`, {
        toastId: "modo-activado",
      });

      return nuevo;
    });
  };

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      {!rutaOcultaFooter && (
        <Header modoClaro={modoClaro} cambiarTema={cambiarTema} />
      )}

      <main className="flex-fill d-flex flex-column">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Rutas públicas */}
            <Route path="/" element={<Inicio />} />
            <Route
              path="/register"
              element={<Register mostrarVideoFondo={true} />}
            />
            <Route path="/login" element={<Login mostrarVideoFondo={true} />} />

            {/* Rutas con sesión */}
            <Route
              path="/home"
              element={
                <RutaPrivada>
                  <Home />
                </RutaPrivada>
              }
            />

            <Route
              path="/populares"
              element={
                <RutaPrivada>
                  <PopularMovies />
                </RutaPrivada>
              }
            />
            <Route
              path="/pelicula/:id"
              element={
                <RutaPrivada>
                  <MovieDetail />
                </RutaPrivada>
              }
            />
            <Route
              path="/favoritos"
              element={
                <RutaPrivada>
                  <Favoritos modoClaro={modoClaro} />
                </RutaPrivada>
              }
            />
            <Route
              path="/serie/:id"
              element={
                <RutaPrivada>
                  <SerieDetail />
                </RutaPrivada>
              }
            />
            <Route
              path="/mis-listas"
              element={
                <RutaPrivada>
                  <MisListas modoClaro={modoClaro} />
                </RutaPrivada>
              }
            />
            <Route
              path="/lista/:id"
              element={
                <RutaPrivada>
                  <ListaDetalle modoClaro={modoClaro} />
                </RutaPrivada>
              }
            />

            <Route
              path="/historial"
              element={
                <RutaPrivada>
                  <Historial modoClaro={modoClaro} />
                </RutaPrivada>
              }
            />
            <Route
              path="/perfil/editar"
              element={
                <RutaPrivada>
                  <EditarPerfil />
                </RutaPrivada>
              }
            />
            <Route
              path="/perfil/password"
              element={
                <RutaPrivada>
                  <CambiarPassword />
                </RutaPrivada>
              }
            />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/buscar/:nombre" element={<Buscar />} />
            <Route path="/director/:id" element={<Director />} />
           <Route path="*" element={<RedireccionRutaDesconocida />} />

          </Routes>
        </AnimatePresence>
      </main>

      {!rutaOcultaFooter && (
        <>
          <Footer modo={mostrarFooterSimple ? "simple" : "completo"} />
          {mostrarChatbot && <ChatbotIA />}
        </>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
