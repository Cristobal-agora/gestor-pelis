import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect } from "react";

const RutaPrivada = ({ children }) => {
  const token = sessionStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      toast.error("Debes iniciar sesión.");
    }
  }, [token]);

  return token ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default RutaPrivada;
