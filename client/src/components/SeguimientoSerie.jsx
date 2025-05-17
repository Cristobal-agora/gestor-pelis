import React, { useEffect, useState } from "react";
import "./SeguimientoSerie.css";

const SeguimientoSerie = ({ tmdbId }) => {
  const [temporadas, setTemporadas] = useState([]);
  const [vista, setVista] = useState({});
  const [visibles, setVisibles] = useState({});
  const token = localStorage.getItem("token");

  const cargarVistos = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/seguimiento/tv/${tmdbId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const vistos = {};
      data.forEach((ep) => {
        vistos[`${ep.temporada}-${ep.episodio}`] = true;
      });
      setVista(vistos);
    } catch (error) {
      console.error("Error al cargar vistos:", error);
    }
  };

  useEffect(() => {
    cargarVistos();
  }, [tmdbId, token]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&language=es-ES`
      );
      const data = await res.json();
      const temporadasData = await Promise.all(
        data.seasons
          .filter((temp) => temp.season_number > 0)
          .map(async (temp) => {
            const resTemp = await fetch(
              `https://api.themoviedb.org/3/tv/${tmdbId}/season/${
                temp.season_number
              }?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=es-ES`
            );
            const dataTemp = await resTemp.json();
            return {
              temporada: temp.season_number,
              episodios: dataTemp.episodes || [],
            };
          })
      );
      setTemporadas(temporadasData);
      const inicial = {};
      temporadasData.forEach((t) => (inicial[t.temporada] = true));
      setVisibles(inicial);
    };
    obtenerDatos();
  }, [tmdbId]);

  const toggleVista = async (temp, ep) => {
    const key = `${temp}-${ep}`;
    const nuevoEstado = !vista[key];
    setVista((prev) => ({ ...prev, [key]: nuevoEstado }));

    const url = `${import.meta.env.VITE_API_URL}/api/seguimiento`;
    const payload = {
      serie_tmdb_id: tmdbId,
      temporada: temp,
      episodio: ep,
    };

    try {
      const res = await fetch(url, {
        method: nuevoEstado ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Error al guardar seguimiento:", await res.text());
      }
    } catch (err) {
      console.error("Error de conexión con el backend:", err);
    }
  };

  const toggleTemporada = (num) => {
    setVisibles((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const marcarTemporada = async (temporada) => {
    const episodios =
      temporadas.find((t) => t.temporada === temporada)?.episodios || [];

    const payload = episodios.map((e) => ({
      serie_tmdb_id: tmdbId,
      temporada,
      episodio: e.episode_number,
    }));

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/seguimiento/varios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      await cargarVistos(); // Carga desde el backend
    } catch (error) {
      console.error("Error al marcar temporada completa:", error);
    }
  };

  const desmarcarTemporada = async (temporada) => {
    const episodios =
      temporadas.find((t) => t.temporada === temporada)?.episodios || [];

    const payload = episodios.map((e) => ({
      serie_tmdb_id: tmdbId,
      temporada,
      episodio: e.episode_number,
    }));

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/seguimiento/varios`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      await cargarVistos(); // Asegura consistencia con lo que hay en la base de datos
    } catch (error) {
      console.error("Error al desmarcar temporada completa:", error);
    }
  };

  return (
    <div className="seguimiento-wrapper mt-4">
      {temporadas.map((t) => {
        const vistos = t.episodios.filter(
          (e) => vista[`${t.temporada}-${e.episode_number}`]
        ).length;

        return (
          <div key={t.temporada} className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-info mb-0">
                Temporada {t.temporada} ({vistos}/{t.episodios.length})
              </h6>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() =>
                    vistos < t.episodios.length
                      ? marcarTemporada(t.temporada)
                      : desmarcarTemporada(t.temporada)
                  }
                >
                  {vistos < t.episodios.length
                    ? "✅ Marcar toda"
                    : "❌ Desmarcar toda"}
                </button>
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => toggleTemporada(t.temporada)}
                >
                  {visibles[t.temporada] ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <ul
              className={`list-group overflow-hidden transition-collapse ${
                visibles[t.temporada] ? "expanded" : "collapsed"
              }`}
            >
              {t.episodios.map((e) => (
                <li
                  key={e.id}
                  className={`list-group-item d-flex justify-content-between align-items-center transition-item ${
                    vista[`${t.temporada}-${e.episode_number}`]
                      ? "visto-episodio"
                      : ""
                  }`}
                >
                  <span>
                    T{t.temporada.toString().padStart(2, "0")} | E
                    {e.episode_number.toString().padStart(2, "0")} – {e.name}
                  </span>
                  <input
                    type="checkbox"
                    disabled={!token}
                    checked={
                      vista[`${t.temporada}-${e.episode_number}`] || false
                    }
                    onChange={() => toggleVista(t.temporada, e.episode_number)}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default SeguimientoSerie;
