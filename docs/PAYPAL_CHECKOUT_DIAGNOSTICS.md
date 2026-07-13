# Diagnóstico de intentos de PayPal

Antes de desplegar el backend, ejecutar `create_paypal_checkout_attempts.sql` en la base de datos de producción.

Cada transición también se escribe en los logs con el prefijo `[PAYPAL_CHECKOUT]`. La tabla conserva el último estado de cada `paypal_order_id` aunque los logs del proveedor expiren.

## Estados

- `CREATED`: el usuario pulsó PayPal y el backend creó la orden. Todavía no implica aprobación ni cobro.
- `APPROVED`: el usuario aprobó la operación dentro de PayPal.
- `CANCELLED`: el usuario cerró o canceló el checkout de PayPal.
- `SDK_ERROR`: el SDK de PayPal falló antes de completar la aprobación.
- `CAPTURE_STARTED`: el backend recibió la solicitud de captura.
- `PAYPAL_COMPLETED`: PayPal confirmó el cobro; todavía se está activando la suscripción local.
- `COMPLETED`: PayPal cobró y la suscripción quedó activada correctamente.
- `CAPTURE_FAILED`: PayPal no confirmó el cobro.
- `CLIENT_CAPTURE_ERROR`: el navegador no recibió una respuesta correcta de la captura. Revisar el estado del backend antes de pedir al usuario que repita el pago.
- `PROCESSING_ERROR`: PayPal confirmó el cobro, pero falló la activación o el procesamiento interno. Este estado requiere revisión manual prioritaria.

## Consultas útiles

Últimos intentos:

```sql
SELECT
  paypal_order_id,
  id_usuario,
  subscription_id,
  plan,
  billing_cycle,
  status,
  error_code,
  error_message,
  created_at,
  updated_at
FROM paypal_checkout_attempts
ORDER BY created_at DESC
LIMIT 100;
```

Intentos que requieren revisión:

```sql
SELECT *
FROM paypal_checkout_attempts
WHERE status IN ('PROCESSING_ERROR', 'CLIENT_CAPTURE_ERROR', 'PAYPAL_COMPLETED')
ORDER BY updated_at DESC;
```

Cancelaciones y errores previos al cobro:

```sql
SELECT *
FROM paypal_checkout_attempts
WHERE status IN ('CANCELLED', 'SDK_ERROR', 'CAPTURE_FAILED')
ORDER BY updated_at DESC;
```
