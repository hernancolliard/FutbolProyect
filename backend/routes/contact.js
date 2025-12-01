const express = require("express");
const router = express.Router();
const db = require("../db");
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
    // Guardar el mensaje en la base de datos
    const query = `
      INSERT INTO contact_messages (name, email, message)
      VALUES (@name, @email, @message)
    `;
    await db.query(query, { name, email, message });

    // Llama a la función para enviar el correo al admin
    await sendContactEmail(name, email, message);
    
    res.status(200).json({ message: "Mensaje enviado con éxito." });
  } catch (error) {
    console.error("Error en la ruta de contacto:", error);
    res.status(500).json({
      message:
        "Hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
    });
  }
});

module.exports = router;

