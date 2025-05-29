import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const RutaPrivada = ({ children }) => {
  const [comprobando, setComprobando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Debes iniciar sesión.");
      }
      setTokenValido(!!token);
      setComprobando(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  if (comprobando) return null;

  return tokenValido ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default RutaPrivada;
