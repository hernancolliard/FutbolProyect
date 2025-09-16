import React from 'react';
import { Link } from 'react-router-dom';

function PagoPendienteMP() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Pago Pendiente</h2>
      <p>Tu pago está pendiente de aprobación.</p>
      <p>Te notificaremos cuando se complete.</p>
      <Link to="/">
        <button>Volver al inicio</button>
      </Link>
    </div>
  );
}

export default PagoPendienteMP;
