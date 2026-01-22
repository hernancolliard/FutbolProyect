const express = require("express");
const router = express.Router();

const {
  verificarToken,
  verificarSuscripcionActiva,
} = require("../middlewares/authMiddleware");

const requireOfertante = require("../middlewares/requireOfertante");
const { createOffer } = require("../controllers/offers.controller");

/**
 * CREAR OFERTA
 * - Token válido
 * - Tipo OFERTANTE
 * - Suscripción activa (admin bypass)
 */
router.post(
  "/offers",
  verificarToken,
  verificarSuscripcionActiva(["OFERTANTE"]),
  requireOfertante,
  createOffer,
);

module.exports = router;
