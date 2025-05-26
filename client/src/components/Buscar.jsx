import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Buscar = () => {
  const { nombre } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(nombre)}&language=es-ES&include_adult=false&page=1`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        console.log("🔍 Resultados de búsqueda:", data);

        const resultadoValido = data.results?.find(
          (item) =>
            (item.media_type === "movie" || item.media_type === "tv") &&
            item.id
        );

        if (resultadoValido) {
          const tipo = resultadoValido.media_type === "tv" ? "serie" : "pelicula";
          navigate(`/${tipo}/${resultadoValido.id}`);
        } else {
          navigate("/no-encontrado");
        }
      } catch (err) {
        console.error("❌ Error en la búsqueda:", err);
        navigate("/no-encontrado");
      }
    };

    buscar();
  }, [nombre, navigate]);

  return <p>Buscando "{nombre}"...</p>;
};

export default Buscar;
