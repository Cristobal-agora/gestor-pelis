import React from "react";
import SeguimientoSerie from "./SeguimientoSerie";
import "./ModalSeguimiento.css";
import { IoClose } from "react-icons/io5";
import { FaTv } from "react-icons/fa";

const ModalSeguimiento = ({ tmdbId, onClose }) => {
  return (
    <div className="modal-seguimiento-backdrop">
      <div className="modal-seguimiento-contenido">
        <button
          className="modal-cerrar-icono"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <IoClose size={28} />
        </button>
        <h4 className="mb-3 d-flex align-items-center">
          <FaTv size={20} className="me-2" />
          Seguimiento de episodios
        </h4>
        <SeguimientoSerie tmdbId={tmdbId} />
      </div>
    </div>
  );
};

export default ModalSeguimiento;
