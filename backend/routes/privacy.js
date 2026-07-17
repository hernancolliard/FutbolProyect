const express = require("express");
const router = express.Router();
const { CURRENT_PRIVACY_VERSION } = require("../legalPolicy");

router.get("/", (req, res) => {
  const privacyContentEs = `
# Política de Privacidad de FutbolProyect

**Versión y fecha de última actualización: ${CURRENT_PRIVACY_VERSION}**

## 1. Responsable y alcance

FutbolProyect es responsable del tratamiento de los datos personales utilizados para operar la plataforma. Esta Política se aplica al sitio, perfiles, ofertas, formularios, suscripciones y comunicaciones de FutbolProyect. Contacto para privacidad y ejercicio de derechos: info@futbolproyect.com.

## 2. Datos que podemos tratar

- Datos de cuenta y contacto: nombre, email, teléfono, tipo de usuario, rol y credenciales protegidas.
- Datos de perfil deportivo y profesional: trayectoria, posición, edad o fecha de nacimiento, ubicación, nacionalidad, medidas, estadísticas, disponibilidad, CV y enlaces.
- Contenido: fotografías, imagen, voz, videos, textos, documentos, informes, valoraciones y ofertas.
- Datos de actividad y seguridad: dirección IP, dispositivo, navegador, registros de acceso, interacciones, cookies y datos necesarios para prevenir fraude.
- Datos de pagos y suscripciones: estado, plan, referencias e identificadores de transacción. Los datos completos del medio de pago son tratados normalmente por el proveedor de pagos.
- Comunicaciones: consultas, denuncias, postulaciones y respuestas enviadas mediante la plataforma.

No solicitamos datos sensibles salvo que sean estrictamente necesarios y exista una base legal adecuada. Evitá publicarlos en campos abiertos.

## 3. Finalidades

Tratamos los datos para crear y administrar cuentas; mostrar perfiles, imágenes y videos; publicar ofertas y postulaciones; facilitar contactos; gestionar suscripciones y pagos; enviar avisos vinculados al servicio; atender consultas y denuncias; moderar contenido; prevenir fraude y abuso; cumplir obligaciones legales; elaborar métricas; mejorar la plataforma; y, con el consentimiento informado correspondiente, difundir contenido de usuarios para promocionar FutbolProyect en el sitio y sus redes oficiales.

## 4. Consentimiento y bases del tratamiento

Al registrarte solicitamos una aceptación expresa de los Términos y esta Política. La aceptación informa el tratamiento necesario para prestar el servicio y la autorización limitada sobre el contenido que decidas publicar. También podemos tratar datos para ejecutar la relación contractual, cumplir obligaciones legales y proteger la seguridad de la plataforma y sus usuarios, según resulte aplicable.

Podés retirar hacia el futuro los consentimientos revocables. La revocación no afecta tratamientos previos lícitos y puede impedir funciones que dependan de esos datos.

## 5. Visibilidad y destinatarios

Según el tipo de dato y la configuración del servicio, la información de perfiles, ofertas, fotos y videos puede ser pública y visible para visitantes, buscadores, usuarios, clubes, agencias, scouts y otros profesionales. El contenido seleccionado también puede publicarse en cuentas oficiales de FutbolProyect en redes sociales con fines institucionales o promocionales.

Podemos compartir datos estrictamente necesarios con proveedores de alojamiento, almacenamiento, correo, seguridad, analítica, traducción, autenticación y pagos; asesores profesionales; autoridades cuando exista obligación o requerimiento válido; y terceros involucrados en una reorganización empresarial con salvaguardas adecuadas. No vendemos tus datos personales como una base independiente.

## 6. Transferencias y servicios internacionales

Algunos proveedores o redes sociales pueden procesar datos fuera de Argentina. Cuando corresponda, procuraremos utilizar proveedores, jurisdicciones o mecanismos contractuales con niveles de protección adecuados conforme a la normativa aplicable. Las publicaciones realizadas en redes sociales también quedan sujetas a las políticas de esas plataformas.

## 7. Conservación

Conservamos los datos mientras la cuenta esté activa y durante el tiempo razonablemente necesario para prestar el servicio, atender reclamos, prevenir fraude y cumplir obligaciones legales. Al solicitar una baja o supresión, eliminaremos o anonimizaremos los datos que no debamos conservar. Copias de respaldo, registros de seguridad y publicaciones ya distribuidas pueden requerir plazos técnicos razonables.

## 8. Seguridad

Aplicamos medidas administrativas y técnicas razonables para reducir riesgos de acceso, alteración, pérdida o divulgación no autorizada. Ningún sistema es infalible; por eso también debés proteger tus credenciales y comunicar cualquier uso sospechoso.

## 9. Tus derechos

Podés solicitar información, acceso, rectificación, actualización, supresión o retiro de consentimientos escribiendo a info@futbolproyect.com y acreditando razonablemente tu identidad. La Ley 25.326 reconoce, entre otros, acceso gratuito en los intervalos legales y rectificación, actualización o supresión. Si considerás insatisfactoria la respuesta, podés reclamar ante la Agencia de Acceso a la Información Pública (AAIP), autoridad de control en Argentina.

## 10. Menores de edad

Las personas menores de 18 años deben utilizar el servicio con autorización y supervisión de su madre, padre o representante legal. Quien autorice debe contar con facultades para consentir el tratamiento y la publicación de datos, imagen, voz y contenido del menor. Podremos retirar contenido o solicitar verificación si detectamos falta de autorización o riesgo.

## 11. Cookies y tecnologías similares

Podemos usar cookies o almacenamiento local necesarios para autenticación, preferencias, seguridad, medición y funcionamiento. Los controles del navegador permiten limitar algunas tecnologías, aunque ciertas funciones podrían dejar de operar.

## 12. Cambios y contacto

Podemos actualizar esta Política e informaremos cambios sustanciales por medios razonables. La versión vigente estará publicada aquí. Para consultas o ejercicio de derechos: info@futbolproyect.com o el formulario de contacto de FutbolProyect.
  `;

  const privacyContentEn = `
# FutbolProyect Privacy Policy

**Version and last updated: ${CURRENT_PRIVACY_VERSION}**

## 1. Controller and scope

FutbolProyect is responsible for processing personal data used to operate the platform. This Policy applies to the website, profiles, offers, forms, subscriptions, and FutbolProyect communications. Privacy and rights contact: info@futbolproyect.com.

## 2. Data we may process

- Account and contact data: name, email, phone number, user type, role, and protected credentials.
- Sports and professional profile data: career history, position, age or date of birth, location, nationality, measurements, statistics, availability, résumé, and links.
- Content: photographs, image, voice, videos, text, documents, reports, ratings, and offers.
- Activity and security data: IP address, device, browser, access logs, interactions, cookies, and data required to prevent fraud.
- Payment and subscription data: status, plan, references, and transaction identifiers. Full payment-method data is normally processed by the payment provider.
- Communications: inquiries, reports, applications, and replies sent through the platform.

We do not request sensitive data unless strictly necessary and supported by an appropriate legal basis. Avoid publishing it in open fields.

## 3. Purposes

We process data to create and manage accounts; display profiles, images, and videos; publish offers and applications; facilitate contact; manage subscriptions and payments; send service notices; handle inquiries and reports; moderate content; prevent fraud and abuse; comply with legal duties; generate metrics; improve the platform; and, with appropriate informed consent, share user content to promote FutbolProyect on the website and its official social media accounts.

## 4. Consent and legal bases

When you register, we request express acceptance of the Terms and this Policy. This acceptance covers processing required to provide the service and the limited permission concerning content you choose to publish. Where applicable, we may also process data to perform the contractual relationship, comply with legal obligations, and protect the platform and its users.

You may withdraw consent for future processing when it is legally revocable. Withdrawal does not affect prior lawful processing and may prevent features that depend on the relevant data.

## 5. Visibility and recipients

Depending on the data type and service settings, profiles, offers, photographs, and videos may be public and visible to visitors, search engines, users, clubs, agencies, scouts, and other professionals. Selected content may also appear on FutbolProyect's official social media accounts for institutional or promotional purposes.

We may share strictly necessary data with hosting, storage, email, security, analytics, translation, authentication, and payment providers; professional advisers; authorities under a valid duty or request; and parties to a corporate reorganization subject to appropriate safeguards. We do not sell personal data as an independent database.

## 6. International transfers and services

Some providers or social networks may process data outside Argentina. Where required, we seek to use providers, jurisdictions, or contractual mechanisms that provide appropriate safeguards under applicable law. Social media posts are also governed by those platforms' policies.

## 7. Retention

We retain data while an account is active and for the reasonable time needed to provide the service, address claims, prevent fraud, and comply with legal duties. After a closure or deletion request, data that need not be retained will be deleted or anonymized. Backups, security logs, and previously distributed posts may require reasonable technical periods.

## 8. Security

We apply reasonable administrative and technical measures to reduce unauthorized access, alteration, loss, or disclosure. No system is infallible, so you must also protect your credentials and report suspected misuse.

## 9. Your rights

You may request information, access, correction, updating, deletion, or withdrawal of consent by writing to info@futbolproyect.com and reasonably proving your identity. Argentine Law 25,326 recognizes, among other rights, free access at statutory intervals and correction, updating, or deletion. If the response is unsatisfactory, you may complain to Argentina's Agency for Access to Public Information (AAIP).

## 10. Minors

People under 18 must use the service with authorization and supervision from a parent or legal representative. The person authorizing use must be legally entitled to consent to processing and publication of the minor's data, image, voice, and content. We may remove content or request verification if authorization is missing or risk is detected.

## 11. Cookies and similar technologies

We may use cookies or local storage required for authentication, preferences, security, measurement, and operation. Browser controls can restrict some technologies, although certain features may stop working.

## 12. Changes and contact

We may update this Policy and will communicate material changes through reasonable means. The current version will be published here. For questions or rights requests: info@futbolproyect.com or the FutbolProyect contact form.
  `;

  const language = String(req.query.lang || "").toLowerCase();
  res.status(200).send(language.startsWith("en") ? privacyContentEn : privacyContentEs);
});

module.exports = router;
