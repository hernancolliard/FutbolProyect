# Agente de ofertas de fútbol

## Activación en producción

El frontend está alojado en Vercel y el backend en Render. Ambos deben desplegar un commit de `main` que incluya el agente; configurar las claves o ejecutar el SQL no actualiza el código del panel. En cada alojamiento comprobar la rama y el commit del despliegue, y que este termine correctamente.

Mantener `DISCOVERY_SCHEDULE_ENABLED=false` para comenzar con búsquedas manuales. Entrar con una cuenta administradora a `/admin`, abrir **Ofertas encontradas** y pulsar **Buscar ahora**. Los borradores aparecen con estado **pendiente** y los errores en **Historial de ejecuciones**. Revisar la fuente y completar el contacto o enlace de postulación antes de publicar.

Si no aparece la pestaña, comprobar el despliegue del frontend. Si aparece pero falla la carga, comprobar el despliegue del backend y que `create_offer_discovery.sql` se haya ejecutado en la misma base configurada en su `DATABASE_URL`. La variable de programación no afecta la visibilidad del panel ni las búsquedas manuales.

## Arquitectura comprobada

El frontend es Next.js 14 / React 18 con Material UI. El panel existente es `src/components/AdminDashboard.tsx` y usa `AdminRoute`, `AuthContext` y el cliente Axios con JWT/cookie. El backend es Express 5, con PostgreSQL (`pg`) y consultas parametrizadas mediante `backend/db.js` y `queryParams.js`. `verificarAdmin` consulta `usuarios.isadmin` en cada solicitud.

La creación activa está en `backend/routes/offers.js`, tabla `ofertas_laborales`, validación `offerSchema`, traducciones `translationService`, caché y avisos a suscriptores. `controllers/offers.controllers.js` es una implementación distinta y no es la ruta que monta el servidor. No se encontró un AGENTS.md dentro del proyecto. Hay referencias a Render; no hay un manifiesto que confirme cómo está provisionado actualmente. Los paquetes declaran Node 24; se alineó el Dockerfile, que todavía usaba Node 18.

## Qué se agregó y archivos

- `backend/services/offerDiscoveryPolicy.js`: configuración Zod, extracción estructurada, evidencia literal, antigüedad, clasificación, identidad y borradores.
- `backend/services/offerDiscoveryFetch.js`: HTTPS, resolución IPv4 pública fijada a la conexión, bloqueo de redes privadas/especiales/metadatos y puertos, validación de cada redirección, robots.txt, límites de bytes y tiempos, sin sesiones ni ejecución de JavaScript.
- `backend/services/offerDiscoveryProviders.js`: Brave Search y OpenAI Responses con JSON Schema estricto, validación posterior, rechazo/incompletitud, presupuesto reservado antes de cada llamada, un reintento máximo.
- `backend/services/offerDiscoveryService.js`: ejecución, exclusiones, comprobación de originales, persistencia, detección de duplicados y cambios, historial, bloqueo PostgreSQL entre procesos.
- `backend/services/offerDiscoveryDb.js`: reutiliza el pool existente sin registrar parámetros que puedan contener contactos publicados.
- `backend/services/offerCreationService.js`: creación y actualización compartidas, extraídas de las rutas activas, con las mismas traducciones y reglas de propietario/administrador.
- `backend/routes/offerDiscovery.js`, `backend/server.js`: endpoints `/api/admin/discovered-offers`, protegidos por los permisos existentes.
- `futbolproyect-nextjs/src/components/DiscoveredOfferManagement.tsx` y `AdminDashboard.tsx`: bandeja, filtros y páginas, datos y evidencia, edición, publicar/descartar, buscar ahora, configuración e historial.
- `create_offer_discovery.sql`: tres tablas nuevas, índices únicos de URL/identidad y control de versión.
- `backend/scripts/discoverOffers.js`, `backend/.env.example`, `backend/Dockerfile`: configuración y ejecución programada.
- `backend/test/offerDiscovery.test.js`: pruebas con datos y proveedores controlados, sin ofertas reales ni notificaciones.

Las ofertas se publican como contenido externo revisado desde la cuenta del administrador autenticado, nunca a nombre de una cuenta de club. La organización y URL original se agregan al resumen público. Esta bandeja no envía avisos a suscriptores. La creación normal conserva sus avisos y caché. Las actualizaciones revisadas reutilizan la oferta publicada, no insertan otra; una edición obsoleta devuelve 409.

## Preparación y prueba local

1. Usar Node 24 y una base PostgreSQL **local o de staging**. No apuntar las pruebas manuales a producción. Instalar dependencias existentes con `npm.cmd ci` en `backend` y en `futbolproyect-nextjs`.
2. Configurar `backend/.env` con `DATABASE_URL` local, `JWT_SECRET`, `FRONTEND_URL=http://localhost:3000`, `PORT=10000` y las claves de los proveedores. El esquema base existente también debe estar instalado para usuarios/ofertas. No se aplicó ninguna migración automáticamente.
3. Aplicar `create_offer_discovery.sql` a esa base, por ejemplo con DBeaver o `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f create_offer_discovery.sql`. La migración solo agrega tablas e índices; no elimina ni transforma datos existentes.
4. En el frontend configurar `NEXT_PUBLIC_API_BASE_URL=http://localhost:10000`. Iniciar backend con `node server.js` desde `backend`; frontend con `npm.cmd run dev` desde `futbolproyect-nextjs`.
5. Entrar con un usuario administrador existente y abrir **Ofertas encontradas**. Elegir dominios originales en `sources`, países en español, puestos, idiomas y límites. `sources: []` permite descubrir fuentes en toda la web y exige la clasificación de fuente original antes de almacenar. Elegir fuentes explícitas da más control.
6. Pulsar **Buscar ahora**. Se devuelve 202 tras guardar el registro de ejecución y el panel consulta el historial mientras trabaja. Si faltan claves, se informa la configuración pendiente; nunca se muestran resultados simulados.
7. Revisar evidencias, nulos (`No informado`), duplicados y fuente. Completar título (5–100 caracteres) y descripción (mínimo 20). Confirmar la revisión y publicar **solo una oferta de prueba en la base local**; volver a publicar debe devolver 409. Se puede guardar y descartar sin publicar.

Pruebas automáticas desde `backend`: `node --test`. Tipos desde `futbolproyect-nextjs`: `node node_modules/typescript/bin/tsc --noEmit --incremental false`. Las pruebas nuevas cubren URL, SSRF/DNS, robots, antigüedad, campos ausentes, vencimiento, búsquedas generales, salida estructurada, costos/reintentos, errores del proveedor, deduplicación repetida/sindicada, simultaneidad, permisos y publicación a través de los servicios compartidos. Usan un adaptador de base de datos en memoria y servidores HTTP locales: no prueban una instancia real de PostgreSQL ni llaman proveedores con cargo.

## Variables y costos

Todas estas variables son **del servidor**:

| Variable | Uso / valor inicial |
| --- | --- |
| `BRAVE_SEARCH_API_KEY` | Token del plan de búsqueda de Brave |
| `OPENAI_API_KEY` | Clave de API de OpenAI |
| `DISCOVERY_OPENAI_MODEL` | `gpt-4o-mini`; usar un modelo compatible con salida estructurada y ajustar sus tarifas |
| `DISCOVERY_SCHEDULE_ENABLED` | `false` hasta configurar el cron y la base |
| `DISCOVERY_SEARCH_USD` | Reserva por intento de consulta; techo inicial USD 0.01 |
| `DISCOVERY_INPUT_USD_PER_MILLION` | Techo de reserva por millón de tokens de entrada; inicial USD 10 |
| `DISCOVERY_OUTPUT_USD_PER_MILLION` | Techo de reserva por millón de tokens de salida; inicial USD 30 |

La configuración del administrador limita cada ejecución a 6 consultas lógicas, 10 páginas candidatas, 180 segundos y USD 0.50 de reserva estimada inicialmente. Cada llamada fallida/reintento también reserva presupuesto. Máximo dos intentos por llamada a un proveedor. Cada página tiene hasta tres redirecciones y una comprobación de robots por destino, 300 KB por página (64 KB para robots), 12 KB de texto enviado y 2500 tokens de salida. Esos accesos auxiliares no son búsquedas de pago. El filtro inicial de siete días usa solo fechas comprobables de publicación; la fecha de indexación o modificación del buscador no cuenta.

Las tarifas configuradas son **techos para presupuestar**, no precios oficiales ni una factura. Se reserva una cota conservadora de tokens de entrada por bytes UTF-8, esquema e instrucciones, y toda la salida máxima. Esto puede terminar una búsqueda antes de llegar al máximo de páginas; reducir las tarifas solo después de comprobar las de tu plan/modelo. No es un límite monetario garantizado si configurás tarifas inferiores a las reales. Configurar también límites de cuenta de ambos proveedores. Con dos ejecuciones diarias y un límite de USD 0.50, la reserva mensual máxima de 30 días es USD 30, más búsquedas manuales, alojamiento y las traducciones Google existentes si `GOOGLE_TRANSLATE_API_KEY` está habilitada al publicar. La reserva del historial no representa consumo facturado.

No se incorporaron dependencias nuevas. Referencias consultadas: [Brave Web Search](https://api-dashboard.search.brave.com/api-reference/web/search/get), [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Render Cron Jobs](https://render.com/docs/cronjobs).

## Programación dos veces al día

Para el alojamiento Render al que apunta el repositorio, preparar un **Cron Job separado**, con raíz `backend`, Node 24, build `npm ci`, comando `node scripts/discoverOffers.js`, y el mismo acceso PostgreSQL y claves del backend. Usar cron `0 9,21 * * *` (UTC): 06:00 y 18:00 de Argentina. No se creó ni desplegó ese servicio.

Mantener `DISCOVERY_SCHEDULE_ENABLED=false` hasta aplicar la migración, configurar credenciales, revisar las fuentes y establecer límites de gasto. Luego ponerlo en `true` en el cron; en el servicio web poner el mismo valor si se quiere que el panel indique programación habilitada. La variable por sí sola no crea un cron. El comando retorna sin consultar proveedores cuando está desactivado. Si otra ejecución manual/programada tiene el lock PostgreSQL, omite el trabajo. Usa una conexión PostgreSQL de sesión estable; no usar pooling en modo transaction para los advisory locks de sesión.

En otro alojamiento, programar el mismo comando y compartir la misma base. Las ejecuciones manuales corren en el proceso Express: si el servicio se reinicia, una ejecución puede interrumpirse. El siguiente trabajador que adquiere el lock marca el registro anterior como interrumpido; las ofertas ya guardadas permanecen. Para reanudación garantizada haría falta una cola durable del alojamiento real.

## Límites y pendientes

- Faltan `BRAVE_SEARCH_API_KEY` y `OPENAI_API_KEY` en el `.env` local inspeccionado. No se hicieron consultas reales con cargo. Hay un `DATABASE_URL` existente, pero no se utilizó para migrar ni publicar; hace falta una base local/staging para validar SQL y flujo completo con datos reales.
- Los datos son extracción asistida por IA y siempre requieren revisión. Se comprueban citas literales de vacante/fechas/vigencia; si la fecha no aparece inequívocamente en ISO dentro de su evidencia, se deja nula y se conserva la evidencia literal disponible. Es una decisión conservadora: fechas en otros formatos pueden necesitar revisión manual.
- IPv6 se rechaza por defecto; páginas PDF, autenticadas, bloqueadas o dependientes de JavaScript se omiten. No se intenta evadir esas restricciones.
- La deduplicación exacta usa URL normalizada y una identidad normalizada de organización, puesto, país/ciudad, categoría y título. Títulos o ubicaciones distintos pueden producir candidatos marcados como posibles duplicados, que requieren comparar antes de publicar. No existe identidad canónica de organización ni fuente original en la tabla legacy; la comparación contra esas ofertas usa título, puesto/ubicación y atribución URL, y puede necesitar juicio humano.
- Si una fuente cambia, su nuevo borrador vuelve a pendiente; una nueva ejecución con datos iguales no pisa una edición manual ni revive un descarte. Revisar `varias_fuentes` porque diferentes páginas pueden discrepar.
- El campo de salario público existente es numérico y no tiene moneda. El importe extraído y moneda se conservan separados en la bandeja; el salario público queda vacío inicialmente. Al completarlo hay que confirmar el importe y escribir la moneda en el resumen.
- Publicación automática futura: `automaticPublication` permanece obligatoriamente `false`; `approvedSources` y `automaticRules` preparan una política de fuentes aprobadas, fechas verificadas y ausencia de advertencias. No hay un publicador automático habilitable en esta primera versión: implementarlo requerirá esa política y validaciones equivalentes al circuito de revisión, una vez evaluadas fuentes reales.
- No se desplegó, no se aplicaron migraciones, no se publicaron ofertas reales ni se enviaron notificaciones.

## Resultado de verificación de esta entrega

`node --test`: 64 pruebas aprobadas, incluidas 17 nuevas. `tsc --noEmit --incremental false`: aprobado. Sintaxis de los módulos modificados y `git diff --check`: aprobados. No se verificó PostgreSQL real, proveedores con cargo ni un despliegue.

## Contacto obligatorio en cada oferta importada

Antes de publicar o actualizar una oferta importada, el backend exige un email, teléfono/WhatsApp o enlace a la página/formulario de postulación. La URL de atribución que se agrega automáticamente al resumen no satisface por sí sola este requisito.

El campo **Contacto o enlace de postulación** se completa con los datos extraídos y se puede corregir en la revisión. Al publicar se conserva en **Detalles adicionales**, bajo `Postulacion y contacto`, aunque el administrador haya editado el resto de los detalles. También se acepta un contacto válido ya escrito en la descripción o en los detalles adicionales. Si falta, la publicación devuelve 400 y la oferta queda pendiente; nunca se inventa un contacto. Se agregó el indicador y filtro `contacto_faltante`. No requiere migraciones ni claves adicionales.
