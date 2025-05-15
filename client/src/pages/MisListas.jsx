import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MisListas = () => {
  const [listas, setListas] = useState([]);
  const [nuevaLista, setNuevaLista] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const obtenerListas = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudieron cargar las listas');
      const data = await res.json();
      setListas(data);
    } catch (err) {
      console.error('Error cargando listas:', err);
      setError('Hubo un problema al cargar tus listas.');
    }
  }, [token]);

  const crearLista = async () => {
    if (!token) return;
    if (!nuevaLista.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nuevaLista }),
      });

      if (!res.ok) throw new Error('Error al crear la lista');
      setNuevaLista('');
      await obtenerListas();
    } catch (err) {
      console.error('Error al crear lista:', err);
      alert('No se pudo crear la lista');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirige si no hay sesión
      return;
    }
    obtenerListas();
  }, [obtenerListas, token, navigate]);

  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-3 text-primary">📂 Mis Listas</h2>

      <div className="d-flex gap-3 mb-4">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Nombre de la nueva lista"
          value={nuevaLista}
          onChange={e => setNuevaLista(e.target.value)}
        />
        <button className="btn btn-success" onClick={crearLista}>
          Crear
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {listas.length === 0 ? (
        <p className="text-muted">No tienes listas creadas aún.</p>
      ) : (
        <ul className="list-group">
          {listas.map(lista => (
            <li key={lista.id} className="list-group-item d-flex justify-content-between align-items-center">
  <Link to={`/lista/${lista.id}`} className="text-decoration-none">{lista.nombre}</Link>
  <button
    className="btn btn-sm btn-outline-danger"
    onClick={async () => {
      const confirmar = confirm(`¿Seguro que quieres eliminar la lista "${lista.nombre}"?`);
      if (!confirmar) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/listas/${lista.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setListas(prev => prev.filter(l => l.id !== lista.id));
        } else {
          const error = await res.json();
          alert(error.mensaje || 'Error al eliminar la lista');
        }
      } catch (err) {
        console.error('❌ Error eliminando lista:', err);
        alert('Error al conectar con el servidor');
      }
    }}
  >
    🗑️
  </button>
</li>

          ))}
        </ul>
      )}
    </div>
  );
};

export default MisListas;
