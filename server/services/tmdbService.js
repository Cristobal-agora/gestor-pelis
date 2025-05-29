const API_BASE = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function getPopularMovies() {
  const res = await fetch(
    `${API_BASE}/movie/popular?api_key=${API_KEY}&language=es-ES`
  );
  if (!res.ok) throw new Error("Error al obtener películas populares");
  return res.json();
}
