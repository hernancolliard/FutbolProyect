# FutbolProyect Affiliate System Implementation

## Auditoria inicial

- Frontend: Next.js 14 con App Router, React, TypeScript permitido por `allowJs`, MUI, React Query y axios.
- Backend: Express 5 en `backend/server.js`.
- Rutas: frontend en `futbolproyect-nextjs/src/app`; API backend bajo `/api/*`.
- Autenticacion: JWT por cookie `token` y fallback `Authorization: Bearer`, middleware `verificarToken`.
- Autorizacion: `verificarAdmin` consulta `usuarios.isadmin`; no hay RBAC granular.
- Usuarios: tabla `usuarios` con `id SERIAL`, `email`, `password_hash`, `tipo_usuario`, `rol`, `isadmin`.
- Base de datos: PostgreSQL con `pg`; no hay ORM.
- Migraciones: archivos `.sql` manuales en la raiz del repo.
- Admin actual: `/admin` con tabs en `AdminDashboard`.
- Registro: `POST /api/users/register`, inserta en `usuarios`, envia bienvenida y genera JWT.
- Suscripciones: tabla `suscripciones` con una fila unica por usuario. `plan`, `fecha_fin`, `estado`, `id_mp_pago`, `id_paypal_pago`, `id_paypal_suscripcion`, `metodo_pago`.
- PayPal actual: `create-paypal-order` crea una orden CAPTURE con `custom_id` como `plan-cycle` o `user_offer`; `capture-paypal-order` activa la suscripcion al capturar.
- Webhook PayPal actual: no existe endpoint activo de webhook PayPal.
- Mercado Pago: `webhook-mp` activa suscripciones por pagos aprobados.
- Variables: `dotenv` en backend; `NEXT_PUBLIC_API_BASE_URL` en frontend.
- Validacion: `zod` en backend disponible, aunque muchas rutas usan validacion manual.
- Dinero: no habia libreria decimal; el MVP calcula comisiones con aritmetica entera sobre centavos y basis points.
- Testing: no habia test runner configurado; se agregan pruebas con `node:test`.

## Archivos modificados o agregados

- `create_affiliate_system.sql`
- `backend/.env.example`
- `backend/server.js`
- `backend/routes/users.js`
- `backend/routes/payments.js`
- `backend/routes/affiliates.js`
- `backend/routes/adminAffiliates.js`
- `backend/services/affiliateConfig.js`
- `backend/services/affiliateCookieService.js`
- `backend/services/affiliateService.js`
- `backend/services/paypalPayloadService.js`
- `backend/test/affiliate.test.js`
- `backend/package.json`
- `futbolproyect-nextjs/src/context/AuthContext.tsx`
- `futbolproyect-nextjs/src/components/auth/Register.tsx`
- `futbolproyect-nextjs/src/components/AdminDashboard.tsx`
- `futbolproyect-nextjs/src/components/AffiliateManagement.tsx`
- `futbolproyect-nextjs/src/components/AffiliateDashboard.tsx`
- `futbolproyect-nextjs/src/app/r/[code]/page.tsx`
- `futbolproyect-nextjs/src/app/afiliados/dashboard/page.tsx`

## Tablas y columnas

Se agregan:

- `affiliates`
- `affiliate_clicks`
- `affiliate_referrals`
- `affiliate_commissions`
- `affiliate_payouts`
- `affiliate_payout_commissions`
- `paypal_webhook_events`
- `affiliate_audit_logs`

Se agregan columnas nullable a `suscripciones`:

- `affiliate_referral_id`
- `paypal_order_id`
- `first_paid_at`
- `created_at`
- `updated_at`

No se generan comisiones retroactivas ni se atribuyen usuarios anteriores automaticamente.

## Flujo de atribucion

1. El visitante entra por `/r/[code]`.
2. El frontend llama `POST /api/affiliates/click/:code`.
3. El backend valida afiliado activo, registra clic, firma cookie `fp_affiliate_ref` con HMAC y devuelve `/register`.
4. En registro se prioriza `affiliateCode` manual sobre cookie.
5. `POST /api/users/register` crea el usuario y luego intenta crear `affiliate_referrals`.
6. La atribucion es unica por usuario y queda bloqueada con `locked_at`.
7. Un error no critico de atribucion no cancela el registro.

## Flujo de comisiones

1. Una suscripcion paga queda enlazada al referral cuando existe.
2. Al capturar una orden PayPal o procesar un webhook `PAYMENT.SALE.COMPLETED`, se intenta crear una comision.
3. La comision se crea solo si la transaccion no fue procesada, el afiliado sigue activo, no hay autorreferido y el periodo de comision esta vigente.
4. La comision queda `PENDING` hasta `available_at = pago + AFFILIATE_HOLD_DAYS`.
5. El admin puede aprobar comisiones disponibles y registrar pagos manuales.
6. Reembolsos y reversas marcan comisiones como `REVERSED`; no se borran registros.

## Integracion con PayPal

El proyecto actual no usa PayPal Subscriptions API sino Orders/Capture. Para compatibilidad:

- Se mantiene el `custom_id` anterior para ordenes que ya dependan de `plan-cycle`.
- Se guarda `paypal_order_id` en `suscripciones`.
- Se registra `id_paypal_pago` como ID de captura/transaccion.
- Se agrega `POST /api/payments/webhook-paypal` idempotente y preparado para los eventos requeridos.
- `PAYPAL_WEBHOOK_ID` queda documentado y se usa para verificar la firma con `/v1/notifications/verify-webhook-signature`.

## Riesgos y compatibilidad

- La tabla `suscripciones` conserva una restriccion unica por usuario, por lo que no modela periodos historicos de multiples pagos. El MVP usa esa tabla y `affiliate_commissions` como historial contable.
- No se implementan PayPal Payouts automaticos.
- No se cambia la arquitectura ni se reemplaza Express/Next.
- Las rutas admin verifican permisos en backend.
- Las cookies se firman con `AFFILIATE_COOKIE_SECRET`; si no se configura, se usa `JWT_SECRET` como fallback.

## Operacion

1. Configurar variables en backend:
   - `AFFILIATE_COOKIE_SECRET`
   - `AFFILIATE_COOKIE_DAYS=60`
   - `AFFILIATE_HOLD_DAYS=30`
   - `AFFILIATE_DEFAULT_COMMISSION_RATE=20`
   - `AFFILIATE_MINIMUM_PAYOUT=20`
   - `AFFILIATE_DEFAULT_COMMISSION_MONTHS=6`
   - `PAYPAL_WEBHOOK_ID`
2. Ejecutar `create_affiliate_system.sql` en PostgreSQL.
3. Crear afiliado desde `/admin`, tab Afiliados.
4. Copiar enlace `/r/codigo`.
5. Probar registro con enlace o codigo manual.
6. Probar pago PayPal Sandbox desde `/suscripcion`.
7. Configurar webhook PayPal hacia `https://API/api/payments/webhook-paypal`.
8. Activar eventos:
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.REFUNDED`
   - `PAYMENT.SALE.REVERSED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
9. Revisar comisiones en `/admin`, tab Comisiones.
10. Aprobar comisiones disponibles y registrar pago manual.
11. Diagnosticar webhooks en `paypal_webhook_events`.
12. Para produccion, pasar `PAYPAL_MODE=live`, credenciales live y webhook live.
