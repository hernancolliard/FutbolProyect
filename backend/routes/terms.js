const express = require("express");
const router = express.Router();
const { CURRENT_TERMS_VERSION } = require("../legalPolicy");

router.get("/", (req, res) => {
  const termsContentEs = `
# Términos y Condiciones de FutbolProyect

**Versión y fecha de última actualización: ${CURRENT_TERMS_VERSION}**

## 1. Aceptación

Al crear una cuenta, marcar la casilla de aceptación o utilizar FutbolProyect, aceptás estos Términos y Condiciones y la Política de Privacidad. Si no estás de acuerdo, no debés crear una cuenta ni utilizar los servicios. La aceptación queda registrada con su fecha y versión.

## 2. Servicio e intermediación

FutbolProyect es una plataforma tecnológica para crear y mostrar perfiles deportivos, publicar ofertas, buscar talento, postularse y facilitar contactos. FutbolProyect no es empleador, representante, agente, club ni parte de los acuerdos que puedan celebrar los usuarios. Salvo indicación expresa, no selecciona candidatos ni garantiza contrataciones, pruebas, remuneraciones o resultados deportivos.

## 3. Requisitos y cuentas

- Debés proporcionar información verdadera, actual y completa y mantenerla actualizada.
- Sos responsable de la seguridad de tu contraseña y de toda actividad realizada desde tu cuenta.
- No podés suplantar personas, clubes, agencias u organizaciones ni crear identidades engañosas.
- Si sos menor de 18 años, solo podés usar el servicio con autorización y supervisión de tu madre, padre o representante legal, quien deberá consentir el tratamiento de tus datos y la publicación de tu imagen, voz y contenido.
- Podemos solicitar verificaciones razonables de identidad o representación y suspender cuentas ante inconsistencias o riesgos.

## 4. Contenido del usuario y derechos de terceros

Conservás la titularidad de los textos, datos, fotografías, imágenes, audios, videos, escudos, marcas y demás contenido que publiques. Declarás que contás con los derechos, permisos y consentimientos necesarios para publicarlo, incluso respecto de terceras personas y menores que aparezcan en él, y que el contenido no infringe derechos de imagen, privacidad, autor, marca u otros derechos.

No publiques datos sensibles o documentación innecesaria, información confidencial de terceros, contenido ilegal, discriminatorio, violento, sexual, fraudulento, difamatorio o que pueda poner a una persona en riesgo.

## 5. Autorización de uso de datos, imagen y contenido

Al publicar contenido, otorgás a FutbolProyect una licencia no exclusiva, gratuita y de alcance mundial para alojar, almacenar, reproducir, adaptar técnicamente, redimensionar, traducir, comunicar, exhibir y difundir ese contenido con estas finalidades:

- operar y mejorar la plataforma y mostrar tu perfil, ofertas o actividad;
- facilitar búsquedas y contactos entre usuarios;
- promocionar FutbolProyect, sus perfiles y oportunidades en el sitio, aplicaciones, comunicaciones institucionales y cuentas oficiales de FutbolProyect en redes sociales;
- crear piezas editoriales o promocionales relacionadas con el ecosistema del fútbol, sin atribuirte declaraciones que no realizaste.

Esta autorización incluye, cuando corresponda, el uso de tu nombre público, imagen y voz incorporados al contenido. No transfiere la propiedad de tu contenido ni autoriza venderlo de forma independiente a terceros. FutbolProyect puede permitir el tratamiento técnico por proveedores que actúen para prestar estos servicios.

Podés revocar hacia el futuro la autorización sobre tu imagen o solicitar el retiro de contenido escribiendo a info@futbolproyect.com. Procesaremos pedidos razonables conforme a la normativa aplicable. La revocación no afecta usos lícitos ya realizados y puede requerir un plazo razonable para retirar publicaciones, copias técnicas o piezas ya distribuidas.

## 6. Ofertas, postulaciones y prevención de fraude

Las ofertas y perfiles son publicados por usuarios. FutbolProyect puede moderarlos o revisarlos, pero no garantiza su identidad, autenticidad, exactitud, legalidad, vigencia, solvencia ni condiciones. Cada usuario debe verificar a la contraparte y evaluar la oportunidad antes de compartir información, viajar, efectuar pagos o asumir compromisos.

No envíes dinero, claves, códigos de autenticación ni documentación sensible sin verificar identidad y finalidad. Denunciá pedidos de pago anticipado, promesas garantizadas, suplantaciones o conductas sospechosas mediante el botón “Denunciar posible estafa” o el formulario de contacto. FutbolProyect podrá investigar, ocultar contenido, suspender cuentas y colaborar con autoridades cuando corresponda, sin que ello implique una garantía previa sobre cada publicación.

## 7. Suscripciones y pagos

Los planes, precios, vigencia, renovación y funcionalidades se informan antes de contratar. Los pagos pueden ser procesados por proveedores externos bajo sus propias condiciones. Nada de estos Términos limita derechos irrenunciables que correspondan a consumidores.

## 8. Usos prohibidos

Está prohibido usar FutbolProyect para cometer fraudes, captar datos mediante engaño, acosar, discriminar, distribuir malware, extraer datos masivamente sin autorización, eludir controles, enviar comunicaciones no solicitadas, publicar ofertas falsas o realizar cualquier actividad contraria a la ley o a derechos de terceros.

## 9. Moderación y baja

Podemos rechazar, limitar, ocultar o eliminar contenido y suspender o cerrar cuentas cuando existan indicios razonables de incumplimiento, fraude, riesgo para usuarios o requerimientos legales. Cuando resulte apropiado, procuraremos informar el motivo y habilitar un canal de revisión. El usuario puede solicitar la baja de su cuenta desde las herramientas disponibles o por contacto.

## 10. Propiedad de la plataforma

El software, diseño, marca, logotipos y contenidos propios de FutbolProyect están protegidos por la normativa aplicable. La licencia sobre contenido de usuarios se rige por la sección 5 y no convierte ese contenido en propiedad de FutbolProyect.

## 11. Servicios y enlaces de terceros

La plataforma puede integrar pagos, almacenamiento, correo, analítica, inicio de sesión y enlaces de terceros. Esos servicios pueden estar sujetos a términos y políticas propios. FutbolProyect no controla sitios externos, aunque selecciona proveedores para operar el servicio.

## 12. Disponibilidad y responsabilidad

El servicio se brinda según disponibilidad y puede sufrir interrupciones o cambios. En la máxima medida permitida por la ley, FutbolProyect no responde por decisiones de contratación, actos u omisiones de usuarios, falsedad de publicaciones, negociaciones, pérdidas derivadas de contactos entre terceros o contenido externo. Esta limitación no excluye responsabilidades que legalmente no puedan limitarse ni daños causados por dolo o culpa cuando corresponda.

## 13. Cambios

Podemos actualizar estos Términos por razones legales, de seguridad o de funcionamiento. Informaremos cambios sustanciales por medios razonables y, cuando corresponda, solicitaremos una nueva aceptación. La versión aplicable estará publicada en esta página.

## 14. Legislación y jurisdicción

Estos Términos se rigen por las leyes de la República Argentina. Cualquier regla de jurisdicción se aplicará sin afectar los derechos y fueros irrenunciables que pudieran corresponder al usuario o consumidor.

## 15. Contacto

Para consultas, denuncias, ejercicio de derechos o pedidos relacionados con contenido e imagen: info@futbolproyect.com o el formulario de contacto de FutbolProyect.
  `;

  const termsContentEn = `
# FutbolProyect Terms and Conditions

**Version and last updated: ${CURRENT_TERMS_VERSION}**

## 1. Acceptance

By creating an account, checking the acceptance box, or using FutbolProyect, you agree to these Terms and Conditions and the Privacy Policy. If you disagree, do not create an account or use the services. The date and version of your acceptance are recorded.

## 2. Service and intermediary role

FutbolProyect is a technology platform for creating and displaying sports profiles, posting opportunities, finding talent, applying, and facilitating contact. FutbolProyect is not an employer, representative, agent, club, or party to agreements between users. Unless expressly stated, it does not select candidates or guarantee contracts, trials, compensation, or sporting outcomes.

## 3. Eligibility and accounts

- You must provide truthful, current, and complete information and keep it updated.
- You are responsible for your password and all activity performed through your account.
- You may not impersonate people, clubs, agencies, or organizations or create misleading identities.
- If you are under 18, you may only use the service with the authorization and supervision of a parent or legal representative, who must consent to the processing of your data and publication of your image, voice, and content.
- We may request reasonable proof of identity or authority and suspend accounts when inconsistencies or risks arise.

## 4. User content and third-party rights

You retain ownership of the text, data, photographs, images, audio, videos, badges, trademarks, and other content you publish. You represent that you hold all necessary rights, permissions, and consents, including for third parties and minors appearing in the content, and that it does not infringe image, privacy, copyright, trademark, or other rights.

Do not publish unnecessary sensitive data or documents, third-party confidential information, or illegal, discriminatory, violent, sexual, fraudulent, defamatory, or dangerous content.

## 5. Permission to use data, image, and content

When you publish content, you grant FutbolProyect a non-exclusive, royalty-free, worldwide license to host, store, reproduce, technically adapt, resize, translate, communicate, display, and distribute it to:

- operate and improve the platform and display your profile, offers, or activity;
- facilitate searches and contact between users;
- promote FutbolProyect, its profiles, and opportunities on the website, applications, institutional communications, and FutbolProyect's official social media accounts;
- create editorial or promotional pieces related to football without attributing statements to you that you did not make.

This permission includes your public name, image, and voice when incorporated into the content. It does not transfer ownership or allow FutbolProyect to sell your content independently. Technical processing may be performed by service providers acting on behalf of FutbolProyect.

You may withdraw future permission regarding your image or request content removal by contacting info@futbolproyect.com. Reasonable requests will be processed under applicable law. Withdrawal does not affect prior lawful uses, and removing distributed materials or technical copies may require a reasonable period.

## 6. Offers, applications, and fraud prevention

Offers and profiles are posted by users. FutbolProyect may moderate or review them but does not guarantee identity, authenticity, accuracy, legality, availability, financial standing, or conditions. Users must verify the other party and assess an opportunity before sharing information, traveling, paying, or making commitments.

Do not send money, passwords, authentication codes, or sensitive documents without verifying identity and purpose. Report advance payment requests, guaranteed promises, impersonation, or suspicious behavior through “Report possible scam” or the contact form. FutbolProyect may investigate, hide content, suspend accounts, and cooperate with authorities, but this does not amount to prior verification of every post.

## 7. Subscriptions and payments

Plans, prices, duration, renewal, and features are shown before purchase. External payment providers may process payments under their own terms. Nothing in these Terms limits non-waivable consumer rights.

## 8. Prohibited uses

You may not use FutbolProyect for fraud, deceptive data collection, harassment, discrimination, malware, unauthorized bulk extraction, control circumvention, unsolicited communications, false offers, or any unlawful activity or infringement of third-party rights.

## 9. Moderation and account closure

We may reject, restrict, hide, or remove content and suspend or close accounts when there are reasonable indications of violations, fraud, user risk, or legal requirements. Where appropriate, we will seek to explain the reason and provide a review channel. Users may request account closure through the available tools or contact channels.

## 10. Platform intellectual property

FutbolProyect's software, design, trademarks, logos, and original content are protected by applicable law. The user-content license is governed by section 5 and does not make user content the property of FutbolProyect.

## 11. Third-party services and links

The platform may integrate payment, storage, email, analytics, login, and other third-party services. Those services may have their own terms and policies. FutbolProyect does not control external websites, although it selects providers to operate the service.

## 12. Availability and liability

The service is provided subject to availability and may be interrupted or changed. To the fullest extent permitted by law, FutbolProyect is not liable for hiring decisions, user acts or omissions, false posts, negotiations, losses arising from third-party contact, or external content. This clause does not exclude liability that cannot legally be limited or liability for intentional misconduct or negligence where applicable.

## 13. Changes

We may update these Terms for legal, security, or operational reasons. Material changes will be communicated through reasonable means and, where appropriate, new acceptance will be requested. The current version will be published on this page.

## 14. Governing law and jurisdiction

These Terms are governed by the laws of the Republic of Argentina. Jurisdiction rules apply without affecting any non-waivable rights or venues available to users or consumers.

## 15. Contact

For questions, reports, rights requests, or requests concerning content and image: info@futbolproyect.com or the FutbolProyect contact form.
  `;

  const language = String(req.query.lang || "").toLowerCase();
  res.status(200).send(language.startsWith("en") ? termsContentEn : termsContentEs);
});

module.exports = router;
