const express = require("express");
const { z } = require("zod");
const db = require("../db");
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/authMiddleware");
const {
  createAffiliate,
  updateAffiliate,
  getAffiliateStats,
  createAuditLog,
  addDecimalStrings,
} = require("../services/affiliateService");

const router = express.Router();
const adminOnly = [verificarToken, verificarAdmin];

const affiliateSchema = z.object({
  user_id: z.union([z.number().int(), z.string(), z.null()]).optional(),
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  code: z.string().trim().optional().or(z.literal("")),
  slug: z.string().trim().optional().or(z.literal("")),
  payout_email: z.string().trim().email().optional().or(z.literal("")).or(z.null()),
  commission_rate: z.coerce.number().min(0).max(100).optional(),
  commission_months: z.coerce.number().int().min(0).optional().or(z.literal("")).or(z.null()),
  cookie_days: z.coerce.number().int().min(1).max(365).optional(),
  minimum_payout: z.coerce.number().min(0).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "BLOCKED"]).optional(),
  notes: z.string().optional().or(z.literal("")).or(z.null()),
});

const commissionStatusSchema = z.enum(["PENDING", "APPROVED", "PAID", "REVERSED", "CANCELLED"]);

router.get("/affiliates", adminOnly, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = { limit, offset };
    if (search) {
      params.search = `%${search}%`;
      conditions.push("(a.name ILIKE @search OR a.email ILIKE @search OR a.code ILIKE @search)");
    }
    if (["ACTIVE", "PAUSED", "BLOCKED"].includes(status)) {
      params.status = status;
      conditions.push("a.status = @status");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT a.*,
              COALESCE(c.total_clicks, 0)::int AS total_clicks,
              COALESCE(c.unique_clicks, 0)::int AS unique_clicks,
              COALESCE(r.registrations, 0)::int AS registrations,
              COALESCE(cm.paying_subscribers, 0)::int AS paying_subscribers,
              COALESCE(cm.gross_revenue, 0)::text AS gross_revenue,
              COALESCE(cm.pending_commission, 0)::text AS pending_commission,
              COALESCE(cm.approved_commission, 0)::text AS approved_commission,
              COALESCE(cm.paid_commission, 0)::text AS paid_commission
       FROM affiliates a
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS total_clicks, COUNT(DISTINCT ip_hash) AS unique_clicks
         FROM affiliate_clicks WHERE affiliate_id = a.id
       ) c ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS registrations
         FROM affiliate_referrals WHERE affiliate_id = a.id
       ) r ON TRUE
       LEFT JOIN LATERAL (
         SELECT
           COUNT(DISTINCT CASE WHEN status IN ('PENDING','APPROVED','PAID') THEN referred_user_id END) AS paying_subscribers,
           SUM(CASE WHEN status IN ('PENDING','APPROVED','PAID') THEN gross_amount ELSE 0 END) AS gross_revenue,
           SUM(CASE WHEN status = 'PENDING' THEN commission_amount ELSE 0 END) AS pending_commission,
           SUM(CASE WHEN status = 'APPROVED' THEN commission_amount ELSE 0 END) AS approved_commission,
           SUM(CASE WHEN status = 'PAID' THEN commission_amount ELSE 0 END) AS paid_commission
         FROM affiliate_commissions WHERE affiliate_id = a.id
       ) cm ON TRUE
       ${where}
       ORDER BY a.created_at DESC
       LIMIT @limit OFFSET @offset`,
      params,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error listando afiliados:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post("/affiliates", adminOnly, async (req, res) => {
  try {
    const parsed = affiliateSchema.parse(req.body);
    const affiliate = await createAffiliate(parsed, req.user.id);
    res.status(201).json(affiliate);
  } catch (error) {
    console.error("Error creando afiliado:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Datos invalidos.", issues: error.issues });
    }
    if (error.code === "23505") {
      return res.status(409).json({ message: "Codigo o slug ya existente." });
    }
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/affiliates/:id", adminOnly, async (req, res) => {
  try {
    const stats = await getAffiliateStats(Number.parseInt(req.params.id, 10));
    if (!stats) return res.status(404).json({ message: "Afiliado no encontrado." });

    const [commissions, payouts] = await Promise.all([
      db.query(
        `SELECT * FROM affiliate_commissions
         WHERE affiliate_id = @id
         ORDER BY created_at DESC
         LIMIT 100`,
        { id: stats.id },
      ),
      db.query(
        `SELECT * FROM affiliate_payouts
         WHERE affiliate_id = @id
         ORDER BY created_at DESC
         LIMIT 100`,
        { id: stats.id },
      ),
    ]);

    res.json({ ...stats, commissions: commissions.rows, payouts: payouts.rows });
  } catch (error) {
    console.error("Error obteniendo afiliado:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.patch("/affiliates/:id", adminOnly, async (req, res) => {
  try {
    const parsed = affiliateSchema.partial().parse(req.body);
    const affiliate = await updateAffiliate(Number.parseInt(req.params.id, 10), parsed, req.user.id);
    if (!affiliate) return res.status(404).json({ message: "Afiliado no encontrado." });
    res.json(affiliate);
  } catch (error) {
    console.error("Error actualizando afiliado:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Datos invalidos.", issues: error.issues });
    }
    if (error.code === "23505") {
      return res.status(409).json({ message: "Codigo o slug ya existente." });
    }
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post("/affiliates/:id/pause", adminOnly, async (req, res) => {
  try {
    const affiliate = await updateAffiliate(Number.parseInt(req.params.id, 10), { status: "PAUSED" }, req.user.id);
    if (!affiliate) return res.status(404).json({ message: "Afiliado no encontrado." });
    res.json(affiliate);
  } catch (error) {
    console.error("Error pausando afiliado:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post("/affiliates/:id/activate", adminOnly, async (req, res) => {
  try {
    const affiliate = await updateAffiliate(Number.parseInt(req.params.id, 10), { status: "ACTIVE" }, req.user.id);
    if (!affiliate) return res.status(404).json({ message: "Afiliado no encontrado." });
    res.json(affiliate);
  } catch (error) {
    console.error("Error activando afiliado:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/affiliate-commissions", adminOnly, async (req, res) => {
  try {
    const conditions = [];
    const params = {
      limit: Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 500),
    };
    if (req.query.affiliateId) {
      params.affiliateId = Number.parseInt(req.query.affiliateId, 10);
      conditions.push("cm.affiliate_id = @affiliateId");
    }
    if (req.query.status && commissionStatusSchema.safeParse(req.query.status).success) {
      params.status = req.query.status;
      conditions.push("cm.status = @status");
    }
    if (req.query.currency) {
      params.currency = String(req.query.currency).toUpperCase().slice(0, 3);
      conditions.push("cm.currency = @currency");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await db.query(
      `SELECT cm.*, a.name AS affiliate_name, a.code AS affiliate_code
       FROM affiliate_commissions cm
       JOIN affiliates a ON a.id = cm.affiliate_id
       ${where}
       ORDER BY cm.created_at DESC
       LIMIT @limit`,
      params,
    );

    if (req.query.format === "csv") {
      const header = "id,affiliate,status,currency,gross_amount,commission_amount,available_at,created_at\n";
      const rows = result.rows.map((row) =>
        [row.id, row.affiliate_code, row.status, row.currency, row.gross_amount, row.commission_amount, row.available_at, row.created_at]
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      );
      res.setHeader("Content-Type", "text/csv");
      return res.send(header + rows.join("\n"));
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error listando comisiones:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post("/affiliate-commissions/:id/approve", adminOnly, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const result = await db.query(
      `UPDATE affiliate_commissions
       SET status = 'APPROVED', approved_at = NOW(), updated_at = NOW()
       WHERE id = @id AND status = 'PENDING' AND available_at <= NOW()
       RETURNING *`,
      { id },
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ message: "La comision no esta disponible para aprobar." });
    }
    await createAuditLog({
      adminUserId: req.user.id,
      action: "COMMISSION_APPROVED",
      entityType: "affiliate_commission",
      entityId: id,
      afterData: result.rows[0],
    });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error aprobando comision:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post("/affiliate-commissions/:id/cancel", adminOnly, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  try {
    const result = await db.query(
      `UPDATE affiliate_commissions
       SET status = 'CANCELLED', reversal_reason = @reason, updated_at = NOW()
       WHERE id = @id AND status IN ('PENDING', 'APPROVED')
       RETURNING *`,
      { id, reason: req.body?.reason || "Cancelacion administrativa" },
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ message: "La comision no se puede cancelar." });
    }
    await createAuditLog({
      adminUserId: req.user.id,
      action: "COMMISSION_CANCELLED",
      entityType: "affiliate_commission",
      entityId: id,
      afterData: result.rows[0],
    });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error cancelando comision:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/affiliate-payouts", adminOnly, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, a.name AS affiliate_name, a.code AS affiliate_code
       FROM affiliate_payouts p
       JOIN affiliates a ON a.id = p.affiliate_id
       ORDER BY p.created_at DESC
       LIMIT 200`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error listando pagos:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post("/affiliate-payouts", adminOnly, async (req, res) => {
  const client = await db.getClient();
  try {
    const commissionIds = Array.isArray(req.body?.commissionIds)
      ? req.body.commissionIds.map((id) => Number.parseInt(id, 10)).filter(Boolean)
      : [];
    if (commissionIds.length === 0) {
      return res.status(400).json({ message: "Selecciona comisiones." });
    }

    await client.query("BEGIN");
    const commissions = await client.query(
      `SELECT * FROM affiliate_commissions
       WHERE id = ANY(@commissionIds)
         AND status = 'APPROVED'
       FOR UPDATE`,
      { commissionIds },
    );
    if (commissions.rows.length !== commissionIds.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Alguna comision no esta aprobada o ya fue pagada." });
    }
    const affiliateIds = new Set(commissions.rows.map((row) => Number(row.affiliate_id)));
    const currencies = new Set(commissions.rows.map((row) => row.currency));
    if (affiliateIds.size !== 1 || currencies.size !== 1) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Todas las comisiones deben ser del mismo afiliado y moneda." });
    }

    const total = addDecimalStrings(
      commissions.rows.map((row) => row.commission_amount),
    );

    const payout = await client.query(
      `INSERT INTO affiliate_payouts
        (affiliate_id, amount, currency, payment_method, external_reference,
         status, paid_at, notes, created_by_admin_id)
       VALUES
        (@affiliateId, @amount, @currency, @paymentMethod, @externalReference,
         'COMPLETED', NOW(), @notes, @adminUserId)
       RETURNING *`,
      {
        affiliateId: commissions.rows[0].affiliate_id,
        amount: total,
        currency: commissions.rows[0].currency,
        paymentMethod: req.body.payment_method || "PAYPAL_MANUAL",
        externalReference: req.body.external_reference || null,
        notes: req.body.notes || null,
        adminUserId: req.user.id,
      },
    );

    for (const commission of commissions.rows) {
      await client.query(
        `INSERT INTO affiliate_payout_commissions (payout_id, commission_id)
         VALUES (@payoutId, @commissionId)`,
        { payoutId: payout.rows[0].id, commissionId: commission.id },
      );
      await client.query(
        `UPDATE affiliate_commissions
         SET status = 'PAID', paid_at = NOW(), updated_at = NOW()
         WHERE id = @commissionId`,
        { commissionId: commission.id },
      );
    }

    await createAuditLog({
      client,
      adminUserId: req.user.id,
      action: "PAYOUT_COMPLETED",
      entityType: "affiliate_payout",
      entityId: payout.rows[0].id,
      afterData: payout.rows[0],
    });
    await client.query("COMMIT");
    res.status(201).json(payout.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando pago manual:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Alguna comision ya fue incluida en un pago." });
    }
    res.status(500).json({ message: "Error del servidor." });
  } finally {
    client.release();
  }
});

module.exports = router;
