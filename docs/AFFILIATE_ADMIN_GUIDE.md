# Guia de uso del sistema de afiliados - Administracion

Esta guia explica como operar el sistema de afiliados de FutbolProyect desde el panel de administracion.

## 1. Accesos principales

Panel de afiliados:

```text
/admin/affiliates
```

Panel de comisiones:

```text
/admin/affiliate-commissions
```

Dashboard del afiliado:

```text
/afiliados/dashboard
```

Ruta publica de referido:

```text
/r/codigo-afiliado
```

## 2. Crear un afiliado

1. Entrar a `/admin/affiliates`.
2. Click en `Crear afiliado`.
3. Completar:
   - Nombre.
   - Email.
   - Usuario relacionado ID, opcional.
   - Codigo, opcional.
   - Slug, opcional.
   - Email de pago.
   - Porcentaje de comision.
   - Meses con comision.
   - Dias de cookie.
   - Pago minimo.
   - Estado.
   - Notas internas.
4. Guardar.

Si no completas codigo o slug, el sistema los genera automaticamente.

## 3. Estados de afiliado

```text
ACTIVE
```

El afiliado puede recibir registros y generar comisiones.

```text
PAUSED
```

El afiliado queda pausado. No deberia usarse para nuevas campanas.

```text
BLOCKED
```

El afiliado queda bloqueado administrativamente.

## 4. Compartir enlace de referido

Cada afiliado tiene un enlace de este formato:

```text
https://www.futbolproyect.com/r/codigo-afiliado
```

Desde el panel podes copiar el enlace y enviarselo al afiliado.

Tambien se acepta este formato:

```text
https://www.futbolproyect.com/register?ref=codigo-afiliado
```

La ruta principal recomendada es `/r/codigo-afiliado`.

## 5. Flujo de atribucion

1. Una persona entra por el enlace del afiliado.
2. El sistema registra el clic.
3. Se guarda una cookie segura de atribucion.
4. La persona llega al registro.
5. Si se registra, queda asociada permanentemente a ese afiliado.
6. Si luego entra por otro enlace, no se cambia la atribucion original.

Prioridad:

1. Codigo manual ingresado en el registro.
2. Cookie de referido.
3. Sin afiliado.

## 6. Flujo de comisiones

1. El referido se registra.
2. El referido compra una suscripcion.
3. PayPal confirma el pago.
4. El sistema crea una comision `PENDING`.
5. La comision queda retenida durante el periodo configurado.
6. Cuando llega la fecha disponible, el administrador puede aprobarla.
7. Luego se registra el pago manual.
8. La comision pasa a `PAID`.

## 7. Estados de comision

```text
PENDING
```

Comision creada, todavia no aprobada.

```text
APPROVED
```

Comision aprobada para pago.

```text
PAID
```

Comision pagada manualmente al afiliado.

```text
REVERSED
```

Comision revertida por reembolso o reversa de PayPal.

```text
CANCELLED
```

Comision cancelada manualmente por administracion.

## 8. Aprobar comisiones

1. Entrar a `/admin/affiliate-commissions`.
2. Buscar la comision.
3. Verificar:
   - Estado `PENDING`.
   - Fecha `available_at` alcanzada.
   - Transaccion relacionada.
4. Click en `Aprobar`.

No se deben aprobar comisiones antes del periodo de seguridad salvo revision administrativa explicita.

## 9. Registrar pago manual

1. Entrar a `/admin/affiliate-commissions`.
2. Seleccionar comisiones `APPROVED`.
3. Verificar que sean:
   - Del mismo afiliado.
   - De la misma moneda.
4. Click en `Registrar pago manual`.
5. El sistema:
   - Crea un registro en `affiliate_payouts`.
   - Relaciona las comisiones.
   - Marca las comisiones como `PAID`.

Los pagos a afiliados no se envian automaticamente por PayPal. El pago real se hace por fuera y queda registrado en el sistema.

## 10. Reembolsos y reversas

Si PayPal informa un reembolso o reversa:

1. El webhook registra el evento.
2. La comision relacionada pasa a `REVERSED`.
3. No se borra el historial.
4. Si ya estaba pagada, se conserva `paid_at` y queda la reversa auditable.

## 11. Variables importantes

En el backend:

```env
AFFILIATE_COOKIE_SECRET=
AFFILIATE_COOKIE_DAYS=60
AFFILIATE_HOLD_DAYS=30
AFFILIATE_DEFAULT_COMMISSION_RATE=20
AFFILIATE_MINIMUM_PAYOUT=20
AFFILIATE_DEFAULT_COMMISSION_MONTHS=6
PAYPAL_WEBHOOK_ID=
```

Si PayPal esta en produccion:

```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=CLIENT_ID_LIVE
PAYPAL_CLIENT_SECRET=SECRET_LIVE
PAYPAL_WEBHOOK_ID=WEBHOOK_ID_LIVE
```

## 12. Webhook PayPal Live

URL del webhook si el backend esta en Render:

```text
https://futbolproyect.onrender.com/api/payments/webhook-paypal
```

Configurar en:

```text
https://developer.paypal.com/dashboard/applications/live
```

Eventos recomendados:

```text
PAYMENT.SALE.COMPLETED
PAYMENT.SALE.REFUNDED
PAYMENT.SALE.REVERSED
BILLING.SUBSCRIPTION.CREATED
BILLING.SUBSCRIPTION.ACTIVATED
BILLING.SUBSCRIPTION.UPDATED
BILLING.SUBSCRIPTION.CANCELLED
BILLING.SUBSCRIPTION.SUSPENDED
BILLING.SUBSCRIPTION.EXPIRED
BILLING.SUBSCRIPTION.PAYMENT.FAILED
```

## 13. Controles de seguridad

El sistema aplica:

- Rutas admin protegidas por rol administrador en backend.
- Cookie de referido firmada.
- Cookie `httpOnly`.
- Hash de IP, sin guardar IP completa.
- Una sola atribucion por usuario.
- Prevencion de autorreferido.
- Comision unica por transaccion PayPal.
- Pago manual transaccional.
- Comision unica por pago manual.
- Historial auditable de eventos principales.

## 14. Checklist de operacion

Antes de usar en produccion:

1. Migracion SQL aplicada.
2. Variables de entorno configuradas.
3. Webhook Live creado.
4. `PAYPAL_WEBHOOK_ID` cargado en Render.
5. Backend redeployado.
6. Frontend redeployado.
7. Crear afiliado de prueba.
8. Probar enlace `/r/codigo`.
9. Probar registro.
10. Probar pago PayPal.
11. Verificar comision `PENDING`.
12. Aprobar comision.
13. Registrar pago manual.
14. Probar reembolso en PayPal.
15. Verificar comision `REVERSED`.

