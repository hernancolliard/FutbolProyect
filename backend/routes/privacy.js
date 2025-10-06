const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const privacyContent = `
# Política de Privacidad de FutbolProyect

**Fecha de última actualización: 19 de septiembre de 2025**

## 1. Introducción

Bienvenido a FutbolProyect. Nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos su información cuando visita nuestro sitio web.

## 2. Recopilación de su información

Podemos recopilar información sobre usted de varias maneras. La información que podemos recopilar en el Sitio incluye:

-   **Datos personales:** Información de identificación personal, como su nombre, dirección de envío, dirección de correo electrónico y número de teléfono, y datos demográficos, como su edad, sexo, ciudad natal e intereses, que nos proporciona voluntariamente cuando se registra en el Sitio o cuando elige participar en diversas actividades relacionadas con el Sitio, como el chat en línea y los foros de mensajes.

-   **Datos derivados:** Información que nuestros servidores recopilan automáticamente cuando accede al Sitio, como su dirección IP, su tipo de navegador, su sistema operativo, sus tiempos de acceso y las páginas que ha visto directamente antes y después de acceder al Sitio.

## 3. Uso de su información

Tener información precisa sobre usted nos permite brindarle una experiencia fluida, eficiente y personalizada. Específicamente, podemos usar la información recopilada sobre usted a través del Sitio para:

-   Crear y administrar su cuenta.
-   Enviarle por correo electrónico un boletín informativo.
-   Habilitar las comunicaciones de usuario a usuario.
-   Administrar compras, pedidos, pagos y otras transacciones relacionadas con el Sitio.

## 4. Divulgación de su información

No compartiremos su información con terceros excepto como se describe en esta Política de Privacidad.

## 5. Seguridad de su información

Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger su información personal.

## 6. Contacto

Si tiene preguntas o comentarios sobre esta Política de Privacidad, contáctenos en: administracion@futbolproyect.com
  `;
  res.status(200).send(privacyContent);
});

module.exports = router;
