import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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

function AppContent() {
  const location = useLocation();
  const rutasSinSesion = ["/login", "/register"];
  const estaEnSinSesion = rutasSinSesion.includes(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("sin-sesion", estaEnSinSesion);
    document.body.classList.toggle("con-sesion", !estaEnSinSesion);
  }, [location.pathname, estaEnSinSesion]);

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      {!estaEnSinSesion && <Header />}

      <main className="flex-fill">
        {estaEnSinSesion ? (
          <Routes>
            <Route path="/" element={<div />} />
            <Route
              path="/register"
              element={<Register mostrarVideoFondo={true} />}
            />
            <Route path="/login" element={<Login mostrarVideoFondo={true} />} />
          </Routes>
        ) : (
          <div className="container mt-2 pt-3">
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/populares" element={<PopularMovies />} />
              <Route path="/pelicula/:id" element={<MovieDetail />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/serie/:id" element={<SerieDetail />} />
              <Route path="/mis-listas" element={<MisListas />} />
              <Route path="/lista/:id" element={<ListaDetalle />} />
              <Route path="/historial" element={<Historial />} />
            </Routes>
          </div>
        )}
      </main>

      {!estaEnSinSesion && <Footer />}
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
