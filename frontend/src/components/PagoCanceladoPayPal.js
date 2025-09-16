import React from 'react';
import { Link } from 'react-router-dom';

function PagoCanceladoPayPal() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Pago Cancelado con PayPal</h2>
      <p>Tu pago ha sido cancelado o no se pudo procesar.</p>
      <p>Por favor, inténtalo de nuevo.</p>
      <Link to="/suscripcion">
        <button>Volver a Suscripciones</button>
      </Link>
    </div>
  );
}

export default PagoCanceladoPayPal;
