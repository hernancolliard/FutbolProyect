const nodemailer = require("nodemailer");

const DEFAULT_FROM_NAME = "FutbolProyect";
const DEFAULT_CONTACT_EMAIL = "info@futbolproyect.com";

let transporter;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const withLineBreaks = (value = "") => escapeHtml(value).replace(/\n/g, "<br>");

const getEmailConfig = () => {
  const port = Number(process.env.EMAIL_PORT || 587);

  return {
    host: process.env.EMAIL_HOST,
    port,
    secure:
      process.env.EMAIL_SECURE !== undefined
        ? process.env.EMAIL_SECURE === "true"
        : port === 465,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from:
      process.env.EMAIL_FROM ||
      `${DEFAULT_FROM_NAME} <${process.env.EMAIL_USER || DEFAULT_CONTACT_EMAIL}>`,
    contactTo: process.env.EMAIL_CONTACT_TO || DEFAULT_CONTACT_EMAIL,
  };
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  if (!config.host) {
    throw new Error("EMAIL_HOST no esta configurado.");
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? {
            user: config.user,
            pass: config.pass,
          }
        : undefined,
  });

  return transporter;
};

const normalizeRecipients = (to) => {
  if (Array.isArray(to)) {
    return to.filter(Boolean);
  }

  return to ? [to] : [];
};

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const recipients = normalizeRecipients(to);

  if (recipients.length === 0) {
    throw new Error("No se indico ningun destinatario.");
  }

  if (!subject) {
    throw new Error("El asunto del correo es obligatorio.");
  }

  const config = getEmailConfig();
  const info = await getTransporter().sendMail({
    from: config.from,
    to: recipients,
    subject,
    html,
    text,
    replyTo,
  });

  console.log(`Email enviado a ${recipients.join(", ")}:`, info.messageId);
  return info;
};

const sendContactEmail = async (name, fromEmail, message) => {
  const config = getEmailConfig();

  return sendEmail({
    to: config.contactTo,
    subject: `Nuevo mensaje de contacto de: ${name}`,
    html: `
      <h1>Nuevo Mensaje del Formulario de Contacto</h1>
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email del remitente:</strong> ${escapeHtml(fromEmail)}</p>
      <hr>
      <h2>Mensaje:</h2>
      <p>${withLineBreaks(message)}</p>
    `,
    text: `Nombre: ${name}\nEmail: ${fromEmail}\n\n${message}`,
    replyTo: fromEmail,
  });
};

const sendWelcomeEmail = async (to, userName, userType) => {
  const safeName = escapeHtml(userName || "usuario");
  let htmlContent = `<h1>Hola ${safeName}, te damos la bienvenida a FutbolProyect!</h1>
                     <p>Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.</p>`;

  if (userType === "postulante") {
    htmlContent += `<p><strong>Importante:</strong> Te recordamos que los perfiles con mayor puntuacion y mas completos son los que aparecen primero en nuestra plataforma. Asegurate de completar tu perfil al 100% para tener la maxima visibilidad.</p>`;
  }

  htmlContent += `<p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    return await sendEmail({
      to,
      subject: "Bienvenido a FutbolProyect!",
      html: htmlContent,
      text: `Hola ${userName || "usuario"}, te damos la bienvenida a FutbolProyect.`,
    });
  } catch (error) {
    console.error(`Error al enviar correo de bienvenida a ${to}:`, error);
  }
};

const sendSubscriptionConfirmationEmail = async (to, userName, plan, endDate) => {
  const formattedEndDate = new Date(endDate).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const safeName = escapeHtml(userName || "usuario");
  const safePlan = escapeHtml(plan);
  const htmlContent = `<h1>Hola ${safeName}, tu suscripcion esta activa!</h1>
                     <p>Te confirmamos que tu suscripcion al plan <strong>${safePlan}</strong> en FutbolProyect ha sido activada.</p>
                     <p>Tu suscripcion es valida hasta el <strong>${escapeHtml(formattedEndDate)}</strong>.</p>
                     <p>Gracias por confiar en nosotros.</p>
                     <p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    return await sendEmail({
      to,
      subject: "Confirmacion de Suscripcion en FutbolProyect",
      html: htmlContent,
      text: `Hola ${userName || "usuario"}, tu suscripcion al plan ${plan} esta activa hasta ${formattedEndDate}.`,
    });
  } catch (error) {
    console.error(`Error al enviar correo de suscripcion a ${to}:`, error);
  }
};

const sendNewOfferNotificationEmail = async (to, offerTitle, offerLink) => {
  const safeTitle = escapeHtml(offerTitle);
  const safeLink = escapeHtml(offerLink);
  const htmlContent = `<h1>Hola!</h1>
                     <p>Hay una nueva oferta laboral que podria interesarte en FutbolProyect:</p>
                     <h2>${safeTitle}</h2>
                     <p>Puedes ver los detalles y postularte haciendo clic en el siguiente boton:</p>
                     <a href="${safeLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Ver Oferta</a>
                     <br>
                     <p>No dejes pasar esta oportunidad!</p>
                     <p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    return await sendEmail({
      to,
      subject: `Nueva Oferta Laboral en FutbolProyect: ${offerTitle}!`,
      html: htmlContent,
      text: `Nueva oferta laboral en FutbolProyect: ${offerTitle}\n${offerLink}`,
    });
  } catch (error) {
    console.error(`Error enviando notificacion de oferta a ${to}:`, error);
  }
};

const sendReplyToContactMessage = async (
  to,
  subject,
  replyMessage,
  originalMessage,
) => {
  const htmlContent = `
    <p>Hola,</p>
    <p>Gracias por contactar a FutbolProyect. Aqui esta la respuesta a tu consulta:</p>
    <div style="padding: 15px; border-left: 4px solid #ccc; background-color: #f5f5f5; margin: 15px 0;">
      <p>${withLineBreaks(replyMessage)}</p>
    </div>
    <hr>
    <p><strong>Tu mensaje original:</strong></p>
    <blockquote style="border-left: 4px solid #eee; padding-left: 15px; color: #666;">
      <p><em>${withLineBreaks(originalMessage)}</em></p>
    </blockquote>
    <p>Saludos,<br>El equipo de FutbolProyect</p>
  `;

  return sendEmail({
    to,
    subject,
    html: htmlContent,
    text: `${replyMessage}\n\nTu mensaje original:\n${originalMessage}`,
  });
};

const sendPasswordResetEmail = async (to, userName, resetLink) => {
  const safeName = escapeHtml(userName || "usuario");
  const safeLink = escapeHtml(resetLink);
  const htmlContent = `<h1>Hola ${safeName}!</h1>
                     <p>Has solicitado restablecer tu contrasena en FutbolProyect.</p>
                     <p>Por favor, haz clic en el siguiente enlace para continuar con el proceso:</p>
                     <a href="${safeLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Restablecer Contrasena</a>
                     <p>Si no solicitaste este cambio, por favor ignora este correo.</p>
                     <p>Saludos,<br>El equipo de FutbolProyect</p>`;

  return sendEmail({
    to,
    subject: "Restablecer Contrasena en FutbolProyect",
    html: htmlContent,
    text: `Hola ${userName || "usuario"}, restablece tu contrasena aqui: ${resetLink}`,
  });
};

const sendNewApplicationNotification = async (to, applicantName, offerTitle) => {
  const safeApplicantName = escapeHtml(applicantName);
  const safeOfferTitle = escapeHtml(offerTitle);
  const htmlContent = `<h1>Hola!</h1>
                     <p>Has recibido una nueva postulacion para tu oferta <strong>${safeOfferTitle}</strong>.</p>
                     <p>El usuario <strong>${safeApplicantName}</strong> se ha postulado.</p>
                     <p>Puedes revisar los detalles de la postulacion en tu panel de control.</p>
                     <p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    return await sendEmail({
      to,
      subject: `Nueva postulacion para tu oferta: ${offerTitle}!`,
      html: htmlContent,
      text: `Has recibido una nueva postulacion de ${applicantName} para tu oferta ${offerTitle}.`,
    });
  } catch (error) {
    console.error(`Error enviando notificacion de postulacion a ${to}:`, error);
  }
};

const sendAdminEmail = async ({ to, subject, message, replyTo }) =>
  sendEmail({
    to,
    subject,
    html: `<p>${withLineBreaks(message)}</p>`,
    text: message,
    replyTo,
  });

module.exports = {
  sendEmail,
  sendContactEmail,
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  sendNewOfferNotificationEmail,
  sendReplyToContactMessage,
  sendPasswordResetEmail,
  sendNewApplicationNotification,
  sendAdminEmail,
};
