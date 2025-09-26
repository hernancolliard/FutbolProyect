const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verificarToken,
  verificarSuscripcionActiva,
} = require("../middleware/authMiddleware");
const { sendNewApplicationNotification } = require("../services/emailService");

// --- RUTA PROTEGIDA: POSTULARSE A UNA OFERTA ---
// Solo usuarios logueados, con el rol 'postulante' y con suscripción activa pueden postularse.
router.post(
  "/",
  [verificarToken, verificarSuscripcionActiva(["postulante"])],
  async (req, res) => {
    const { id_oferta, mensaje_presentacion } = req.body;
    const id_usuario_postulante = req.user.id;

    if (!id_oferta) {
      return res
        .status(400)
        .json({ message: "El ID de la oferta es obligatorio." });
    }

    try {
      const query = `
            INSERT INTO postulaciones (id_oferta, id_usuario_postulante, mensaje_presentacion)
            OUTPUT inserted.id_oferta
            VALUES (@id_oferta, @id_usuario_postulante, @mensaje_presentacion);
        `;
      const result = await db.query(query, {
        id_oferta,
        id_usuario_postulante,
        mensaje_presentacion: mensaje_presentacion || null,
      });

      // Notificar al ofertante
      try {
        const inserted_id_oferta = result.rows[0].id_oferta;

        // Obtener detalles de la oferta y del ofertante
        const offerDetailsQuery = `
          SELECT o.titulo, u.email AS email_ofertante
          FROM ofertas_laborales o
          JOIN usuarios u ON o.id_usuario_ofertante = u.id
          WHERE o.id = @inserted_id_oferta
        `;
        const offerDetailsResult = await db.query(offerDetailsQuery, { inserted_id_oferta });
        
        if (offerDetailsResult.rows.length > 0) {
          const { titulo, email_ofertante } = offerDetailsResult.rows[0];
          const applicantName = req.user.name;
          await sendNewApplicationNotification(email_ofertante, applicantName, titulo);
        }
      } catch (emailError) {
        console.error("Error al enviar el correo de notificación de postulación:", emailError);
        // No bloquear la postulación si el email falla.
      }

      res.status(201).json({ message: "Postulación enviada correctamente." });
    } catch (error) {
      // Comprueba si el error es por una violación de la restricción UNIQUE (código 2627 en SQL Server)
      if (error.number === 2627) {
        return res
          .status(409)
          .json({ message: "Ya te has postulado a esta oferta." });
      }
      console.error("Error al crear la postulación:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al crear la postulación." });
    }
  }
);

module.exports = router;