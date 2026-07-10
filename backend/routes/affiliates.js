const express = require("express");
const { verificarToken } = require("../middleware/authMiddleware");
const {
  createAffiliateCookieValue,
  setAffiliateCookie,
} = require("../services/affiliateCookieService");
const {
  getAffiliateByCode,
  recordAffiliateClick,
  getAffiliateStats,
} = require("../services/affiliateService");
const db = require("../db");

const router = express.Router();

const sanitizeLandingPath = (value) => {
  const raw = String(value || "/register").trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/register";
  if (/^\/https?:/i.test(raw)) return "/register";
  return raw.slice(0, 300);
};

router.post("/click/:code", async (req, res) => {
  try {
    const affiliate = await getAffiliateByCode(req.params.code);
    if (!affiliate) {
      return res.status(404).json({ message: "Afiliado no encontrado." });
    }

    const landingPath = sanitizeLandingPath(req.body?.landingPath || req.query?.landingPath);
    const click = await recordAffiliateClick({ affiliate, req, landingPath });
    const cookieValue = createAffiliateCookieValue({
      affiliateId: affiliate.id,
      clickId: click.id,
      maxAgeDays: affiliate.cookie_days,
    });
    setAffiliateCookie(res, cookieValue, affiliate.cookie_days);

    res.json({
      redirectTo: landingPath,
      code: affiliate.code,
    });
  } catch (error) {
    console.error("Error registrando click de afiliado:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/me", verificarToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM affiliates WHERE user_id = @userId LIMIT 1",
      { userId: req.user.id },
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No hay afiliado asociado a este usuario." });
    }
    const stats = await getAffiliateStats(result.rows[0].id);
    res.json(stats);
  } catch (error) {
    console.error("Error obteniendo afiliado propio:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/me/stats", verificarToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id FROM affiliates WHERE user_id = @userId LIMIT 1",
      { userId: req.user.id },
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No hay afiliado asociado a este usuario." });
    }
    const stats = await getAffiliateStats(result.rows[0].id);
    res.json(stats);
  } catch (error) {
    console.error("Error obteniendo estadisticas propias:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/me/commissions", verificarToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cm.status, cm.gross_amount, cm.currency, cm.commission_rate,
              cm.commission_amount, cm.payment_number, cm.available_at,
              cm.created_at,
              CONCAT('Usuario #', SUBSTRING(md5(cm.referred_user_id::text), 1, 4)) AS referred_label
       FROM affiliate_commissions cm
       JOIN affiliates a ON a.id = cm.affiliate_id
       WHERE a.user_id = @userId
       ORDER BY cm.created_at DESC
       LIMIT 100`,
      { userId: req.user.id },
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo comisiones propias:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/me/payouts", verificarToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.amount, p.currency, p.payment_method, p.status, p.paid_at,
              p.created_at, p.external_reference
       FROM affiliate_payouts p
       JOIN affiliates a ON a.id = p.affiliate_id
       WHERE a.user_id = @userId
       ORDER BY p.created_at DESC
       LIMIT 100`,
      { userId: req.user.id },
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo pagos propios:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

module.exports = router;
