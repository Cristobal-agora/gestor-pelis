import React from "react";
import SeguimientoSerie from "./SeguimientoSerie";
import "./ModalSeguimiento.css"; // Asegúrate de tener este archivo

const ModalSeguimiento = ({ tmdbId, onClose }) => {
  return (
    <div className="modal-seguimiento-backdrop">
      <div className="modal-seguimiento-contenido">
        <button className="modal-cerrar-btn" onClick={onClose}>
          ✖ Cerrar
        </button>
        <h4 className="mb-3">📺 Seguimiento de episodios</h4>
        <SeguimientoSerie tmdbId={tmdbId} />
      </div>
    </div>
  );
};



export default ModalSeguimiento;
