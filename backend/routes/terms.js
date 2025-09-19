const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const termsContent = `
# Términos y Condiciones de FutbolProyect

**Fecha de última actualización: 19 de septiembre de 2025**

## 1. Aceptación de los Términos

Al acceder y utilizar este servicio, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.

## 2. Descripción del Servicio

FutbolProyect es una plataforma que conecta a futbolistas con equipos y agencias. Los usuarios pueden crear perfiles, publicar ofertas de trabajo y postularse a oportunidades.

## 3. Cuentas de Usuario

-   Usted es responsable de mantener la confidencialidad de su contraseña y cuenta.
-   Debe tener al menos 16 años para utilizar este servicio.

## 4. Conducta del Usuario

-   No debe publicar contenido ilegal, ofensivo o que infrinja los derechos de terceros.
-   El incumplimiento de estas reglas puede resultar en la suspensión o terminación de su cuenta.

## 5. Propiedad Intelectual

Todo el contenido y la propiedad intelectual en la plataforma son propiedad de FutbolProyect, a menos que se indique lo contrario. No puede reproducir, distribuir ni utilizar nuestro contenido sin permiso explícito.

## 6. Limitación de Responsabilidad

FutbolProyect no se hace responsable de daños directos, indirectos, incidentales o consecuentes que resulten del uso de nuestro servicio.

## 7. Cambios en los Términos

Nos reservamos el derecho de modificar estos términos en cualquier momento. Le notificaremos de cualquier cambio significativo.
  `;
  res.status(200).send(termsContent);
});

module.exports = router;
