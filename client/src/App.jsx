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
import { useEffect } from "react";
import MisListas from "./pages/MisListas";
import ListaDetalle from "./pages/ListaDetalle";
import Historial from "./components/Historial";
import Footer from "./components/Footer"; // asegúrate de que la ruta sea correcta
import Inicio from "./pages/Inicio";
import EditarPerfil from "./components/EditarPerfil";
import CambiarPassword from "./components/CambiarPassword";
import ChatbotIA from "./components/ChatbotIA";

function AppContent() {
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  const mostrarChatbot =
    token && !["/login", "/register", "/"].includes(location.pathname);

  const rutasSinFooter = ["/login", "/register"];
  const rutaOcultaFooter = rutasSinFooter.includes(location.pathname);
  const mostrarFooterSimple = location.pathname === "/";

  useEffect(() => {
    const rutaActual = location.pathname;
    const esRutaSinFooter = ["/login", "/register"].includes(rutaActual);

    document.body.classList.toggle("sin-sesion", esRutaSinFooter);
    document.body.classList.toggle("con-sesion", !esRutaSinFooter);
  }, [location.pathname]);

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      {!rutaOcultaFooter && <Header />}

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
            <Route path="/home" element={<Home />} />
            <Route path="/populares" element={<PopularMovies />} />
            <Route path="/pelicula/:id" element={<MovieDetail />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/serie/:id" element={<SerieDetail />} />
            <Route path="/mis-listas" element={<MisListas />} />
            <Route path="/lista/:id" element={<ListaDetalle />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/perfil/editar" element={<EditarPerfil />} />
            <Route path="/perfil/password" element={<CambiarPassword />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!rutaOcultaFooter && (
        <>
          <Footer modo={mostrarFooterSimple ? "simple" : "completo"} />
          {mostrarChatbot && <ChatbotIA />}
        </>
      )}
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
