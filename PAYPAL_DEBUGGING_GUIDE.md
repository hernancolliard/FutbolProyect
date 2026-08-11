# Guía de Diagnóstico - PayPal Cancelaciones Automáticas

## 🔍 Paso 1: Revisar Logs del Navegador

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer un pago
4. Busca estos logs:
   - `[PAYPAL_CREATE_ORDER]` - Debe mostrar que la orden se crea exitosamente
   - `[PAYPAL_CANCEL_EVENT]` - Si aparece, el SDK está disparando `onCancel` automáticamente
   - `[PAYPAL_SDK_ERROR]` - Si aparece, hay un error del SDK

## 🔍 Paso 2: Revisar Logs del Servidor

Después de intentar un pago, busca en los logs:

```bash
# Logs de creación de orden
[PAYPAL_CHECKOUT] {"status":"CREATED",...}

# Logs de evento
[PAYPAL_CHECKOUT_EVENT] Evento recibido: { event: "CANCELLED", ... }
[PAYPAL_CHECKOUT_EVENT] Token verificado correctamente: { orderID: "...", userId: ... }
```

### Si ves CANCELLED con error de token:
- El `trackingToken` está expirado o mal formado
- Verifica que el frontend está guardando el token correctamente

### Si ves CANCELLED sin errores:
- El SDK está disparando `onCancel` automáticamente
- Podría ser problema de conexión o configuración

## 🔧 Paso 3: Verificar Configuración

### Frontend (futbolproyect-nextjs/src/app/suscripcion/page.tsx)

Asegúrate que:
```tsx
<PayPalScriptProvider
  options={{
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    // ✅ Debe estar presente
  }}
>
```

**Verificar ClientID:**
- ¿Está definido en `.env.local`?
- ¿Es válido? (Sandbox o Live)
- ¿Corresponde al modo de PayPal que estás usando?

```bash
# En .env.local debe existir:
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxxxx
```

### Backend (backend/.env)

Asegúrate que:
```bash
PAYPAL_MODE=sandbox  # o 'live'
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_WEBHOOK_ID=xxxxx
JWT_SECRET=xxxxx (6+ horas de expiración para trackingToken)
```

## 🔴 Problema: Ventana Emergente de PayPal No Abre

Si la ventana no abre:
1. Verifica que el navegador permite pop-ups
2. Verifica que no hay bloqueadores de pop-ups
3. Revisa si hay un CSP (Content Security Policy) que bloquee paypal.com

## 🔴 Problema: SDK Error Inmediato

Si ves `[PAYPAL_SDK_ERROR]` inmediatamente:
1. Revisa la consola del navegador para mensajes de error completos
2. Verifica que el ClientID es válido
3. Verifica que estás usando el modo correcto (Sandbox vs Live)

## 📊 Verificación de Base de Datos

Consulta la tabla `paypal_checkout_attempts`:

```sql
SELECT 
  paypal_order_id,
  id_usuario,
  subscription_id,
  status,
  error_code,
  error_message,
  created_at,
  updated_at,
  cancelled_at
FROM paypal_checkout_attempts
WHERE status = 'CANCELLED'
ORDER BY created_at DESC
LIMIT 20;
```

Busca patrones:
- Todas las cancelaciones tienen `error_code = null` → Problema del SDK
- Todas las cancelaciones tienen el mismo tiempo entre CREATED y CANCELLED → Automatizado
- Las cancelaciones ocurren en ciertos momentos → Podría ser un cron o timeout

## 🛠️ Soluciones Potenciales

### Solución 1: Reintentos Automáticos
Implementar un sistema de reintentos en el frontend:
- Si se cancela dentro de 10 segundos sin error → reintentar automáticamente
- Máximo 3 reintentos

### Solución 2: Aumentar Tiempo de Expiración del Token
Si el token expira muy rápido:
```javascript
// En paypalCheckoutTelemetryService.js
const createPaypalTrackingToken = ({ orderID, userId }) =>
  jwt.sign(
    { scope: TRACKING_SCOPE, orderID: String(orderID), userId: Number(userId) },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }  // Cambiar de 6h a 24h
  );
```

### Solución 3: Validar en Frontend
Asegurar que `trackingToken` existe antes de permitir el checkout:
```javascript
if (!orderID || !trackingToken) {
  console.error("CRITICAL: No tracking token!");
  throw new Error("Payment tracking failed");
}
```

## 📞 Contactar Soporte PayPal

Si después de estas verificaciones el problema persiste:
1. Contacta a PayPal Support
2. Proporciona:
   - Logs de `[PAYPAL_CHECKOUT_EVENT]` (con orderIDs)
   - Logs de navegador (screenshot del console)
   - ClientID (sin revelar secrets)
   - Modo (Sandbox o Live)

## 📝 Checklist de Verificación Final

- [ ] ClientID está definido en `.env.local`
- [ ] Backend `.env` tiene PAYPAL_MODE, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
- [ ] JWT_SECRET está definido en backend `.env`
- [ ] Navegador permite pop-ups
- [ ] No hay CSP bloqueando paypal.com
- [ ] Logs del frontend muestran `[PAYPAL_CREATE_ORDER] Orden creada exitosamente`
- [ ] Logs del servidor muestran evento siendo procesado
- [ ] Base de datos muestra los intentos
- [ ] No hay errores en la consola del navegador
