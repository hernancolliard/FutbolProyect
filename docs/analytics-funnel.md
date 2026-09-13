# Embudo de conversiÃ³n

FutbolProyect envÃ­a eventos anÃ³nimos al `dataLayer` del navegador. Google Tag
Manager toma esos eventos y, si el contenedor tiene una etiqueta de GA4,
Google Analytics los almacena para construir el embudo.

ConfiguraciÃ³n actual:

- Contenedor GTM: `GTM-KP7M2SZW`
- Flujo GA4: `G-HM9PCYG2K3`

Los identificadores pueden reemplazarse en otro entorno mediante
`NEXT_PUBLIC_GTM_ID` y `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

La aplicaciÃ³n no guarda estos eventos en su base de datos. Tampoco envÃ­a nombre,
email, telÃ©fono ni identificadores de usuario.

## Eventos

| Evento | Momento | ParÃ¡metros |
| --- | --- | --- |
| `sign_up` | Alta completada | `method`, `account_type`, `user_role` |
| `profile_started` | El perfil alcanza al menos 25% | `account_type`, `user_role`, `profile_completion_range` |
| `profile_essential_completed` | Completa datos, foto, trayectoria y video o CV | `account_type`, `user_role`, `profile_completion_range` |
| `subscription_prompt_viewed` | Se muestra la invitaciÃ³n de suscripciÃ³n | `source_path`, `account_type`, `user_role`, `profile_completion_range` |
| `subscription_plans_clicked` | Abre los planes desde la invitaciÃ³n | `source`, `account_type`, `user_role` |
| `begin_checkout` | El proveedor crea el inicio de pago | `plan_type`, `billing_cycle`, `payment_provider` |

Los eventos de avance esencial se deduplican en el navegador por cuenta. La
invitaciÃ³n de suscripciÃ³n se registra una vez por sesiÃ³n, igual que su regla de
visualizaciÃ³n.

## ConfiguraciÃ³n necesaria en GTM

1. Confirmar que `GTM-KP7M2SZW` corresponde al contenedor publicado.
2. Crear un activador de evento personalizado para cada nombre anterior, o uno
   con una expresiÃ³n regular que los agrupe.
3. Crear una etiqueta de evento de GA4 que reenvÃ­e el nombre del evento y sus
   parÃ¡metros.
4. Probar con Preview/Tag Assistant y publicar el contenedor.
5. En GA4, marcar como conversiones `sign_up`,
   `profile_essential_completed` y el evento de compra confirmado que ya use el
   sistema de pagos.

Si GTM no tiene una etiqueta de GA4 publicada, el `dataLayer` recibe los eventos
durante la navegaciÃ³n pero no existe almacenamiento histÃ³rico.
