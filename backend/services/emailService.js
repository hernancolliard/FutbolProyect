const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Futbol-EMP" <no-reply@futbol-emp.com>',
    to: to,
    subject: 'Restablecimiento de contraseña',
    html: `
      <p>Has solicitado un restablecimiento de contraseña.</p>
      <p>Haz clic en este <a href="${resetUrl}">enlace</a> para establecer una nueva contraseña.</p>
      <p>Si no solicitaste esto, por favor ignora este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: '"Futbol-EMP" <no-reply@futbol-emp.com>',
    to: to,
    subject: '¡Bienvenido a Futbol-EMP!',
    html: `
      <h1>¡Hola, ${name}!</h1>
      <p>Te damos la bienvenida a Futbol-EMP, la plataforma que conecta talentos del fútbol con oportunidades únicas.</p>
      <p>Ya puedes empezar a explorar ofertas o a buscar el talento que necesitas.</p>
      <p>¡Mucha suerte!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendNewApplicationNotification = async (to, applicantName, offerTitle) => {
  const mailOptions = {
    from: '"Futbol-EMP" <no-reply@futbol-emp.com>',
    to: to,
    subject: `¡Nueva postulación para tu oferta: ${offerTitle}!`, 
    html: `
      <h1>¡Has recibido un nuevo postulante!</h1>
      <p>El usuario <b>${applicantName}</b> se ha postulado a tu oferta de trabajo "<b>${offerTitle}</b>".</p>
      <p>Puedes revisar todas las postulaciones en tu panel de control.</p>
      <p>¡Mucha suerte en tu búsqueda!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendNewApplicationNotification };
