const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/subscriptions - Obtener todos los planes de suscripción públicos y activos
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM subscription_plans WHERE is_active = TRUE");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

module.exports = router;
