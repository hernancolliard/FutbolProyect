const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/authMiddleware");

// Todas las rutas en este archivo están protegidas y requieren ser admin

// GET /api/admin/users - Obtener todos los usuarios
router.get("/users", [verificarToken, verificarAdmin], async (req, res) => {
  try {
    const result = await db.query(
            "SELECT id, nombre, email, tipo_usuario, fecha_creacion, isadmin FROM usuarios ORDER BY fecha_creacion DESC"
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
    try {
      // Opcional: verificar que no se esté eliminando a sí mismo
      if (parseInt(id, 10) === req.user.id) {
        return res.status(400).json({
          message: "No puedes eliminar tu propia cuenta de administrador.",
        });
      }
      await db.query("DELETE FROM usuarios WHERE id = @id", { id });
      res.status(200).json({ message: "Usuario eliminado exitosamente." });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ message: "Error del servidor." });
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
      SELECT o.*, u.nombre as nombre_ofertante
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

module.exports = router;
