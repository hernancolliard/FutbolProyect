const express = require("express");
const { z } = require("zod");
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/authMiddleware");
const { sendAdminEmail } = require("../services/emailService");

const router = express.Router();

const adminEmailSchema = z.object({
  to: z
    .union([z.string().email(), z.array(z.string().email()).min(1).max(50)])
    .transform((value) => (Array.isArray(value) ? value : [value])),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(1).max(10000),
  replyTo: z.string().email().optional(),
});

router.post("/send", [verificarToken, verificarAdmin], async (req, res) => {
  const parsed = adminEmailSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Datos invalidos para enviar el email.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const info = await sendAdminEmail(parsed.data);

    res.status(202).json({
      message: "Email enviado correctamente.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error al enviar email desde la API:", error);
    res.status(500).json({
      message: "No se pudo enviar el email.",
    });
  }
});

module.exports = router;
