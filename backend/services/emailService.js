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

// Por ahora, solo exportamos esta función. Puedes añadir las otras después si las necesitas.
module.exports = {
  sendContactEmail,
};
