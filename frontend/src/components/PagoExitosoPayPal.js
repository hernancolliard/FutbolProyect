import React from 'react';
import { Link } from 'react-router-dom';

function PagoExitosoPayPal() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>¡Pago Exitoso con PayPal!</h2>
      <p>Tu suscripción se ha procesado correctamente.</p>
      <p>Gracias por tu compra.</p>
      <Link to="/">
        <button>Volver al inicio</button>
      </Link>
    </div>
  );
}

export default PagoExitosoPayPal;
