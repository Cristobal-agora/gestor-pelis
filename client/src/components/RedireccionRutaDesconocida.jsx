import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const RedireccionRutaDesconocida = () => {
  useEffect(() => {
    toast.error("Ruta no encontrada.");
  }, []);

  const token = sessionStorage.getItem("token");
  return <Navigate to={token ? "/home" : "/login"} replace />;
};

export default RedireccionRutaDesconocida;
