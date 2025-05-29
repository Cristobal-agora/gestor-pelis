import React, { useEffect, useState, useCallback } from "react";
import "./SeguimientoSerie.css";
import { FaCheck, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

const SeguimientoSerie = ({ tmdbId }) => {
  const [temporadas, setTemporadas] = useState([]);
  const [vista, setVista] = useState({});
  const [visibles, setVisibles] = useState({});
  const token = sessionStorage.getItem("token");

  const cargarVistos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/seguimiento/tv/${tmdbId}`,
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
  }, [tmdbId, token]);

  const marcarSerieComoVista = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/historial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tmdb_id: tmdbId, tipo: "tv" }),
      });
    } catch (err) {
      console.error("Error al registrar serie como vista:", err);
    }
  };

  const eliminarSerieDelHistorial = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/historial/${tmdbId}/tv`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error al eliminar serie del historial:", err);
    }
  };

  useEffect(() => {
    cargarVistos();
  }, [cargarVistos]);

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
      temporadasData.forEach((t) => (inicial[t.temporada] = false));
      setVisibles(inicial);
    };
    obtenerDatos();
  }, [tmdbId]);

  const toggleVista = async (temp, ep) => {
    const key = `${temp}-${ep}`;
    const nuevoEstado = !vista[key];
    setVista((prev) => ({ ...prev, [key]: nuevoEstado }));

    const url = `${import.meta.env.VITE_API_URL}/seguimiento`;
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
      } else if (nuevoEstado) {
        await marcarSerieComoVista();
      } else {
        const episodiosVistos = Object.values({
          ...vista,
          [key]: nuevoEstado,
        }).filter(Boolean).length;

        if (episodiosVistos === 0) {
          await eliminarSerieDelHistorial();
        }
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

      await cargarVistos();
      await marcarSerieComoVista();
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

      await cargarVistos();
      const totalVistos = Object.values(vista).filter(Boolean).length;
      if (totalVistos === 0) {
        await eliminarSerieDelHistorial();
      }
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
          <div key={t.temporada} className="seguimiento-bloque mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-info mb-0 fw-bold">
                Temporada {t.temporada}{" "}
                <span className="text-secondary fw-normal">
                  ({vistos}/{t.episodios.length})
                </span>
              </h6>
              <div className="d-flex gap-2">
                <button
                  className={`btn btn-sm fw-semibold d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm transition-color ${
                    vistos < t.episodios.length ? "btn-verde" : "btn-rojo"
                  }`}
                  onClick={() =>
                    vistos < t.episodios.length
                      ? marcarTemporada(t.temporada)
                      : desmarcarTemporada(t.temporada)
                  }
                >
                  {vistos < t.episodios.length ? (
                    <>
                      <FaCheck /> Marcar toda
                    </>
                  ) : (
                    <>
                      <FaTimes /> Desmarcar toda
                    </>
                  )}
                </button>

                <button
                  className="btn btn-sm btn-toggle-temporada d-flex align-items-center gap-2 px-3 py-1"
                  onClick={() => toggleTemporada(t.temporada)}
                >
                  {visibles[t.temporada] ? (
                    <>
                      <FaChevronUp /> Ocultar
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Mostrar
                    </>
                  )}
                </button>
              </div>
            </div>

            {visibles[t.temporada] && (
              <ul className="list-group transition-collapse">
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
                    <button
                      className={`btn btn-sm px-2 py-1 fw-bold rounded-pill d-flex align-items-center gap-2 ${
                        vista[`${t.temporada}-${e.episode_number}`]
                          ? "btn-success"
                          : "btn-outline-check"
                      }`}
                      onClick={(eBtn) => {
                        eBtn.preventDefault();
                        toggleVista(t.temporada, e.episode_number);
                      }}
                      title={
                        vista[`${t.temporada}-${e.episode_number}`]
                          ? "Episodio marcado como visto"
                          : "Marcar como visto"
                      }
                    >
                      <FaCheck
                        style={{
                          color: vista[`${t.temporada}-${e.episode_number}`]
                            ? "white"
                            : "#bbb",
                        }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SeguimientoSerie;
