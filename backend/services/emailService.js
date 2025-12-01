const { Resend } = require("resend");

// Resend se configura automáticamente con la variable de entorno RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo electrónico a través de Resend desde el formulario de contacto.
 * @param {string} name - El nombre del remitente.
 * @param {string} fromEmail - El email del remitente.
 * @param {string} message - El mensaje del formulario.
 */
const sendContactEmail = async (name, fromEmail, message) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "FutbolProyect <info@futbolproyect.com>", // ¡Importante! Este es un remitente por defecto de Resend.
      to: ["info@futbolproyect.com"], // Tu correo donde recibes los mensajes.
      subject: `Nuevo mensaje de contacto de: ${name}`,
      html: `
        <h1>Nuevo Mensaje del Formulario de Contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email del remitente:</strong> ${fromEmail}</p>
        <hr>
        <h2>Mensaje:</h2>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      reply_to: fromEmail, // Permite que al darle "Responder", se responda al email del usuario.
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("Correo de contacto enviado con éxito:", data);
    return data;
  } catch (error) {
    console.error("Error al enviar correo con Resend:", error);
    throw error;
  }
};

/**
 * Envía un correo de bienvenida a un nuevo usuario.
 * @param {string} to - Email del destinatario.
 * @param {string} userName - Nombre del usuario.
 * @param {string} userType - Tipo de usuario ('postulante', 'ofertante', etc.).
 */
const sendWelcomeEmail = async (to, userName, userType) => {
  let subject = '¡Bienvenido a FutbolProyect!';
  let htmlContent = `<h1>¡Hola ${userName}, te damos la bienvenida a FutbolProyect!</h1>
                     <p>Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.</p>`;

  if (userType === 'postulante') {
    htmlContent += `<p><b>Importante:</b> Te recordamos que los perfiles con mayor puntuación y más completos son los que aparecen primero en nuestra plataforma. ¡Asegúrate de completar tu perfil al 100% para tener la máxima visibilidad!</p>`;
  }

  htmlContent += `<p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'FutbolProyect <info@futbolproyect.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Correo de bienvenida enviado con éxito a ${to}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al enviar correo de bienvenida a ${to}:`, error);
    // No relanzamos el error para no detener el flujo principal (ej. el registro)
  }
};

/**
 * Envía un correo de confirmación de suscripción.
 * @param {string} to - Email del destinatario.
 * @param {string} userName - Nombre del usuario.
 * @param {string} plan - Nombre del plan.
 * @param {Date} endDate - Fecha de finalización de la suscripción.
 */
const sendSubscriptionConfirmationEmail = async (to, userName, plan, endDate) => {
  const subject = 'Confirmación de Suscripción en FutbolProyect';
  const formattedEndDate = new Date(endDate).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const htmlContent = `<h1>¡Hola ${userName}, tu suscripción está activa!</h1>
                     <p>Te confirmamos que tu suscripción al plan <strong>${plan}</strong> en FutbolProyect ha sido activada.</p>
                     <p>Tu suscripción es válida hasta el <strong>${formattedEndDate}</strong>.</p>
                     <p>Gracias por confiar en nosotros.</p>
                     <p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'FutbolProyect <info@futbolproyect.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Correo de suscripción enviado con éxito a ${to}:`, data);
    return data;
  } catch (error) {
    console.error(`Error al enviar correo de suscripción a ${to}:`, error);
  }
};

/**
 * Envía un correo notificando sobre una nueva oferta laboral.
 * @param {string} to - Email del destinatario.
 * @param {string} offerTitle - Título de la oferta.
 * @param {string} offerLink - Enlace a la oferta.
 */
const sendNewOfferNotificationEmail = async (to, offerTitle, offerLink) => {
  const subject = `¡Nueva Oferta Laboral en FutbolProyect: ${offerTitle}!`;
  const htmlContent = `<h1>¡Hola!</h1>
                     <p>Hay una nueva oferta laboral que podría interesarte en FutbolProyect:</p>
                     <h2>${offerTitle}</h2>
                     <p>Puedes ver los detalles y postularte haciendo clic en el siguiente botón:</p>
                     <a href="${offerLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Ver Oferta</a>
                     <br>
                     <p>¡No dejes pasar esta oportunidad!</p>
                     <p>Saludos,<br>El equipo de FutbolProyect</p>`;

  try {
    // Usamos un try-catch para cada correo individualmente.
    const { data, error } = await resend.emails.send({
      from: 'FutbolProyect <info@futbolproyect.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error(`Error enviando notificación de oferta a ${to}:`, error.message);
    } else {
      console.log(`Notificación de nueva oferta enviada a ${to}.`);
    }
  } catch (error) {
    console.error(`Error catastrófico enviando notificación de oferta a ${to}:`, error);
  }
};

/**
 * Envía la respuesta de un administrador a un mensaje de contacto.
 * @param {string} to - Email del usuario original.
 * @param {string} subject - Asunto del correo.
 * @param {string} replyMessage - El mensaje de respuesta del admin.
 * @param {string} originalMessage - El mensaje original del usuario.
 */
const sendReplyToContactMessage = async (to, subject, replyMessage, originalMessage) => {
  const htmlContent = `
    <p>Hola,</p>
    <p>Gracias por contactar a FutbolProyect. Aquí está la respuesta a tu consulta:</p>
    <div style="padding: 15px; border-left: 4px solid #ccc; background-color: #f5f5f5; margin: 15px 0;">
      <p>${replyMessage.replace(/\n/g, "<br>")}</p>
    </div>
    <hr>
    <p><strong>Tu mensaje original:</strong></p>
    <blockquote style="border-left: 4px solid #eee; padding-left: 15px; color: #666;">
      <p><em>${originalMessage.replace(/\n/g, "<br>")}</em></p>
    </blockquote>
    <p>Saludos,<br>El equipo de FutbolProyect</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'FutbolProyect <info@futbolproyect.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Respuesta de contacto enviada a ${to}.`);
    return data;
  } catch (error) {
    console.error(`Error enviando respuesta de contacto a ${to}:`, error);
    throw error; // Relanzar para que la ruta de la API pueda manejarlo
  }
};



// Por ahora, solo exportamos esta función. Puedes añadir las otras después si las necesitas.
module.exports = {
  sendContactEmail,
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  sendNewOfferNotificationEmail,
  sendReplyToContactMessage,
};
