import React from 'react';

const DetalleItem = ({ icono, etiqueta, valor, color = 'text-primary' }) => (
  <p className="mb-2 d-flex align-items-start flex-wrap">
    <span className="me-2" style={{ fontSize: '1.1rem' }}>{icono}</span>
    <strong className={`${color} me-1`}>{etiqueta}</strong>
    <span className="text-light" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
      {valor}
    </span>
  </p>
);

export default DetalleItem;
