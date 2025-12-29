const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/authMiddleware");

const {
  sendSubscriptionConfirmationEmail,
  sendReplyToContactMessage,
} = require("../services/emailService");

// Todas las rutas en este archivo están protegidas y requieren ser admin

// GET /api/admin/users - Obtener todos los usuarios
router.get("/users", [verificarToken, verificarAdmin], async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        u.id,
        u.nombre,
        u.email,
        u.tipo_usuario,
        u.fecha_creacion,
        u.isadmin,
        u.profile_views,
        s.plan as subscription_plan,
        s.fecha_fin as subscription_end_date,
        s.estado as subscription_status
      FROM
        usuarios u
      LEFT JOIN
        suscripciones s ON u.id = s.id_usuario
      ORDER BY
        u.fecha_creacion DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// DELETE /api/admin/users/:id - Eliminar un usuario
router.delete(
  "/users/:id",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const { id } = req.params;
    const client = await db.getClient(); // Obtener un cliente del pool

    try {
      // Opcional: verificar que no se esté eliminando a sí mismo
      if (parseInt(id, 10) === req.user.id) {
        return res.status(400).json({
          message: "No puedes eliminar tu propia cuenta de administrador.",
        });
      }

      await client.query("BEGIN"); // Iniciar transacción

      // Eliminar referencias en 'postulaciones'
      await client.query(
        "DELETE FROM postulaciones WHERE id_usuario_postulante = @id",
        { id }
      );

      // Eliminar al usuario
      await client.query("DELETE FROM usuarios WHERE id = @id", { id });

      await client.query("COMMIT"); // Finalizar transacción

      res.status(200).json({ message: "Usuario eliminado exitosamente." });
    } catch (error) {
      await client.query("ROLLBACK"); // Revertir en caso de error
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ message: "Error del servidor." });
    } finally {
      client.release(); // Liberar el cliente
    }
  }
);

// POST /api/admin/users/:id/grant-subscription - Grant a free subscription
router.post(
  "/users/:id/grant-subscription",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const { id: userId } = req.params;
    const { planType, duration } = req.body;

    if (!planType || !duration) {
      return res
        .status(400)
        .json({ message: "Plan type and duration are required." });
    }

    try {
      const fechaFin = new Date();
      if (duration === "1-month") {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
      } else if (duration === "1-year") {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
      } else {
        return res.status(400).json({ message: "Invalid duration." });
      }

      const queryText = `
      INSERT INTO suscripciones (id_usuario, plan, fecha_fin, estado, metodo_pago)
      VALUES (@userId, @planType, @fechaFin, 'activa', 'admin_grant')
      ON CONFLICT (id_usuario) DO UPDATE SET
        plan = @planType,
        fecha_fin = @fechaFin,
        estado = 'activa',
        metodo_pago = 'admin_grant';
    `;

      await db.query(queryText, {
        userId: parseInt(userId, 10),
        planType: planType,
        fechaFin: fechaFin,
      });

      // Get user info for email
      const userResult = await db.query('SELECT nombre, email FROM usuarios WHERE id = @userId', { userId: parseInt(userId, 10) });
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        // Send confirmation email (don't block the response)
        sendSubscriptionConfirmationEmail(user.email, user.nombre, planType, fechaFin)
          .catch(emailError => console.error("Failed to send subscription email:", emailError));
      }

      res.status(200).json({ message: "Subscription granted successfully." });
    } catch (error) {
      console.error("Error granting subscription:", error);
      res
        .status(500)
        .json({ message: "Server error while granting subscription." });
    }
  }
);

// GET /api/admin/offers - Obtener todas las ofertas
router.get("/offers", [verificarToken, verificarAdmin], async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, u.nombre as nombre_ofertante, (SELECT COUNT(*) FROM postulaciones p WHERE p.id_oferta = o.id) as application_count
      FROM ofertas_laborales o
      JOIN usuarios u ON o.id_usuario_ofertante = u.id
      ORDER BY o.fecha_publicacion DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// DELETE /api/admin/offers/:id - Eliminar una oferta
router.delete(
  "/offers/:id",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM ofertas_laborales WHERE id = @id", { id });
      res.status(200).json({ message: "Oferta eliminada exitosamente." });
    } catch (error) {
      console.error("Error al eliminar oferta:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  }
);

// GET /api/admin/subscriptions - Get all subscription plans
router.get(
  "/subscriptions",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM subscription_plans");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// PUT /api/admin/subscriptions/:id - Update a subscription plan
router.put(
  "/subscriptions/:id",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const { id } = req.params;
    const { price_usd, price_mp } = req.body;

    if (price_usd === undefined || price_mp === undefined) {
      return res
        .status(400)
        .json({ message: "price_usd and price_mp are required." });
    }

    try {
      await db.query(
        "UPDATE subscription_plans SET price_usd = @price_usd, price_mp = @price_mp WHERE id = @id",
        { id: parseInt(id, 10), price_usd, price_mp }
      );
      res
        .status(200)
        .json({ message: "Subscription plan updated successfully." });
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

// --- Contact Messages Management ---

// GET /api/admin/contact-messages - Get all contact messages
router.get('/contact-messages', [verificarToken, verificarAdmin], async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/admin/contact-messages/:id/reply - Reply to a contact message
router.post('/contact-messages/:id/reply', [verificarToken, verificarAdmin], async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;
  const adminId = req.user.id;

  if (!replyMessage) {
    return res.status(400).json({ message: 'Reply message is required.' });
  }

  try {
    // 1. Get the original message
    const messageResult = await db.query('SELECT * FROM contact_messages WHERE id = @id', { id });
    if (messageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    const originalMessage = messageResult.rows[0];

    // Prevent replying to an already replied message
    if (originalMessage.status === 'replied') {
      return res.status(409).json({ message: 'This message has already been replied to.' });
    }

    // 2. Send the email
    await sendReplyToContactMessage(
      originalMessage.email,
      `Re: Tu mensaje para FutbolProyect`,
      replyMessage,
      originalMessage.message
    );

    // 3. Update the database
    const updateQuery = `
      UPDATE contact_messages
      SET status = 'replied',
          replied_at = NOW(),
          reply_message = @replyMessage,
          replied_by_admin_id = @adminId
      WHERE id = @id
      RETURNING *;
    `;
    const updatedResult = await db.query(updateQuery, { replyMessage, adminId, id });

    res.json(updatedResult.rows[0]);

  } catch (error) {
    console.error('Error replying to contact message:', error);
    res.status(500).json({ message: 'Server error while sending reply.' });
  }
});


module.exports = router;

// PATCH /api/admin/offers/:id/toggle-feature - Toggle the featured status of an offer
router.patch(
  "/offers/:id/toggle-feature",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.query(
        "UPDATE ofertas_laborales SET is_featured = NOT is_featured WHERE id = @id RETURNING id, is_featured",
        { id: parseInt(id, 10) }
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Offer not found." });
      }
      res.status(200).json({
        message: "Offer feature status toggled successfully.",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error("Error toggling offer feature status:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);
