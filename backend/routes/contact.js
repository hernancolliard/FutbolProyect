const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../services/emailService");
const { z } = require("zod");
const validate = require("../middleware/validateMiddleware");

// Esquema de validación para los datos del formulario
const contactSchema = z.object({
  name: z.string().min(2, "El nombre es demasiado corto."),
  email: z.string().email("Por favor, introduce un email válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

// Ruta para recibir los datos del formulario de contacto
router.post("/", validate(contactSchema), async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Llama a la función para enviar el correo
    await sendContactEmail(name, email, message);
    res.status(200).json({ message: "Mensaje enviado con éxito." });
  } catch (error) {
    console.error("Error al enviar el correo de contacto:", error);
    res.status(500).json({
      message:
        "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.",
    });
  }
});

module.exports = router;
