const crypto = require("crypto");
const db = require("../db");
const { getAffiliateConfig } = require("./affiliateConfig");
const { readAffiliateCookie } = require("./affiliateCookieService");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const randomCode = (name) => {
  const base = normalizeCode(name).replace(/-/g, "").slice(0, 16) || "afiliado";
  return `${base}-${crypto.randomBytes(3).toString("hex")}`;
};

const hashSensitive = (value) => {
  if (!value) return null;
  const secret = getAffiliateConfig().cookieSecret;
  return crypto.createHmac("sha256", secret).update(String(value)).digest("hex");
};

const parseCents = (amount) => {
  const raw = String(amount || "0").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error(`Monto invalido: ${amount}`);
  }
  const [units, decimals = ""] = raw.split(".");
  return BigInt(units) * 100n + BigInt(decimals.padEnd(2, "0"));
};

const centsToDecimal = (cents) => {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;
  const units = absolute / 100n;
  const decimals = String(absolute % 100n).padStart(2, "0");
  return `${sign}${units}.${decimals}`;
};

const addDecimalStrings = (values) => {
  const totalCents = values.reduce((sum, value) => sum + parseCents(value), 0n);
  return centsToDecimal(totalCents);
};

const parseBasisPoints = (rate) => {
  const raw = String(rate || "0").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error(`Porcentaje invalido: ${rate}`);
  }
  const [units, decimals = ""] = raw.split(".");
  return BigInt(units) * 100n + BigInt(decimals.padEnd(2, "0"));
};

const calculateCommissionAmount = (grossAmount, commissionRate) => {
  const cents = parseCents(grossAmount);
  const basisPoints = parseBasisPoints(commissionRate);
  const raw = cents * basisPoints;
  const roundedCents = (raw + 5000n) / 10000n;
  return centsToDecimal(roundedCents);
};

const getAffiliateByCode = async (code, client = db) => {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const result = await client.query(
    `SELECT * FROM affiliates
     WHERE (code = @code OR slug = @code) AND status = 'ACTIVE'
     LIMIT 1`,
    { code: normalized },
  );
  return result.rows[0] || null;
};

const createAuditLog = async ({
  client = db,
  adminUserId,
  action,
  entityType,
  entityId,
  beforeData = null,
  afterData = null,
}) => {
  await client.query(
    `INSERT INTO affiliate_audit_logs
      (admin_user_id, action, entity_type, entity_id, before_data, after_data)
     VALUES (@adminUserId, @action, @entityType, @entityId, @beforeData, @afterData)`,
    {
      adminUserId: adminUserId || null,
      action,
      entityType,
      entityId: entityId || null,
      beforeData,
      afterData,
    },
  );
};

const createAffiliate = async (payload, adminUserId) => {
  const config = getAffiliateConfig();
  const code = normalizeCode(payload.code) || randomCode(payload.name);
  const slug = normalizeCode(payload.slug) || code;
  const result = await db.query(
    `INSERT INTO affiliates
      (user_id, name, email, code, slug, payout_email, commission_rate,
       commission_months, cookie_days, minimum_payout, status, notes, created_by_admin_id)
     VALUES
      (@userId, @name, @email, @code, @slug, @payoutEmail, @commissionRate,
       @commissionMonths, @cookieDays, @minimumPayout, @status, @notes, @adminUserId)
     RETURNING *`,
    {
      userId: payload.user_id || null,
      name: String(payload.name || "").trim(),
      email: normalizeEmail(payload.email),
      code,
      slug,
      payoutEmail: payload.payout_email ? normalizeEmail(payload.payout_email) : null,
      commissionRate: payload.commission_rate || config.defaultCommissionRate,
      commissionMonths:
        payload.commission_months === "" || payload.commission_months === undefined
          ? config.defaultCommissionMonths
          : payload.commission_months,
      cookieDays: payload.cookie_days || config.cookieDays,
      minimumPayout: payload.minimum_payout || config.minimumPayout,
      status: payload.status || "ACTIVE",
      notes: payload.notes || null,
      adminUserId,
    },
  );
  await createAuditLog({
    adminUserId,
    action: "AFFILIATE_CREATED",
    entityType: "affiliate",
    entityId: result.rows[0].id,
    afterData: result.rows[0],
  });
  return result.rows[0];
};

const updateAffiliate = async (id, payload, adminUserId) => {
  const before = await db.query("SELECT * FROM affiliates WHERE id = @id", { id });
  if (before.rows.length === 0) return null;
  const current = before.rows[0];
  const code = payload.code === undefined ? current.code : normalizeCode(payload.code);
  const slug = payload.slug === undefined ? current.slug : normalizeCode(payload.slug);
  const result = await db.query(
    `UPDATE affiliates SET
      user_id = @userId,
      name = @name,
      email = @email,
      code = @code,
      slug = @slug,
      payout_email = @payoutEmail,
      commission_rate = @commissionRate,
      commission_months = @commissionMonths,
      cookie_days = @cookieDays,
      minimum_payout = @minimumPayout,
      status = @status,
      notes = @notes,
      updated_at = NOW()
     WHERE id = @id
     RETURNING *`,
    {
      id,
      userId: payload.user_id === undefined ? current.user_id : payload.user_id || null,
      name: payload.name === undefined ? current.name : String(payload.name).trim(),
      email: payload.email === undefined ? current.email : normalizeEmail(payload.email),
      code,
      slug,
      payoutEmail:
        payload.payout_email === undefined
          ? current.payout_email
          : payload.payout_email
            ? normalizeEmail(payload.payout_email)
            : null,
      commissionRate: payload.commission_rate === undefined ? current.commission_rate : payload.commission_rate,
      commissionMonths:
        payload.commission_months === undefined ? current.commission_months : payload.commission_months || null,
      cookieDays: payload.cookie_days === undefined ? current.cookie_days : payload.cookie_days,
      minimumPayout: payload.minimum_payout === undefined ? current.minimum_payout : payload.minimum_payout,
      status: payload.status === undefined ? current.status : payload.status,
      notes: payload.notes === undefined ? current.notes : payload.notes || null,
    },
  );
  await createAuditLog({
    adminUserId,
    action: "AFFILIATE_UPDATED",
    entityType: "affiliate",
    entityId: id,
    beforeData: current,
    afterData: result.rows[0],
  });
  return result.rows[0];
};

const recordAffiliateClick = async ({ affiliate, req, landingPath }) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
  const ipHash = hashSensitive(ip);
  const userAgentHash = hashSensitive(req.headers["user-agent"]);

  const recent = await db.query(
    `SELECT id FROM affiliate_clicks
     WHERE affiliate_id = @affiliateId
       AND ip_hash = @ipHash
       AND user_agent_hash = @userAgentHash
       AND created_at > NOW() - INTERVAL '10 minutes'
     ORDER BY id DESC
     LIMIT 1`,
    { affiliateId: affiliate.id, ipHash, userAgentHash },
  );

  if (recent.rows[0]) return recent.rows[0];

  const result = await db.query(
    `INSERT INTO affiliate_clicks
      (affiliate_id, landing_path, referrer_url, utm_source, utm_medium,
       utm_campaign, ip_hash, user_agent_hash)
     VALUES
      (@affiliateId, @landingPath, @referrerUrl, @utmSource, @utmMedium,
       @utmCampaign, @ipHash, @userAgentHash)
     RETURNING *`,
    {
      affiliateId: affiliate.id,
      landingPath: landingPath || "/register",
      referrerUrl: req.get("referer") || null,
      utmSource: req.body?.utm_source || req.query?.utm_source || null,
      utmMedium: req.body?.utm_medium || req.query?.utm_medium || null,
      utmCampaign: req.body?.utm_campaign || req.query?.utm_campaign || null,
      ipHash,
      userAgentHash,
    },
  );
  return result.rows[0];
};

const createReferralForUser = async ({
  client = db,
  req,
  userId,
  userEmail,
  manualCode,
}) => {
  const existing = await client.query(
    "SELECT id FROM affiliate_referrals WHERE referred_user_id = @userId",
    { userId },
  );
  if (existing.rows.length > 0) return existing.rows[0];

  let affiliate = null;
  let clickId = null;
  let method = null;

  if (manualCode) {
    affiliate = await getAffiliateByCode(manualCode, client);
    method = affiliate ? "CODE" : null;
  }

  if (!affiliate) {
    const cookie = readAffiliateCookie(req);
    if (cookie?.affiliateId) {
      const result = await client.query(
        "SELECT * FROM affiliates WHERE id = @id AND status = 'ACTIVE'",
        { id: cookie.affiliateId },
      );
      affiliate = result.rows[0] || null;
      clickId = cookie.clickId || null;
      method = affiliate ? "LINK" : null;
    }
  }

  if (!affiliate) return null;

  if (affiliate.user_id && Number(affiliate.user_id) === Number(userId)) {
    return null;
  }
  if (normalizeEmail(affiliate.email) === normalizeEmail(userEmail)) {
    return null;
  }

  const result = await client.query(
    `INSERT INTO affiliate_referrals
      (affiliate_id, referred_user_id, affiliate_click_id, attribution_method, locked_at)
     VALUES (@affiliateId, @userId, @clickId, @method, NOW())
     ON CONFLICT (referred_user_id) DO NOTHING
     RETURNING *`,
    {
      affiliateId: affiliate.id,
      userId,
      clickId,
      method,
    },
  );
  return result.rows[0] || null;
};

const attachReferralToSubscription = async ({ client = db, userId }) => {
  const referral = await client.query(
    "SELECT id FROM affiliate_referrals WHERE referred_user_id = @userId",
    { userId },
  );
  if (referral.rows.length === 0) return null;

  await client.query(
    `UPDATE suscripciones
     SET affiliate_referral_id = COALESCE(affiliate_referral_id, @referralId),
         updated_at = NOW()
     WHERE id_usuario = @userId`,
    { referralId: referral.rows[0].id, userId },
  );
  return referral.rows[0];
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const createCommissionForPayment = async ({
  client = db,
  userId,
  paypalTransactionId,
  paypalSubscriptionId = null,
  paypalWebhookEventId = null,
  grossAmount,
  currency,
  paymentDate = new Date(),
}) => {
  if (!paypalTransactionId || !grossAmount || !currency) return null;

  const subscription = await client.query(
    `SELECT s.*, r.id AS referral_id, r.affiliate_id, r.attributed_at,
            a.status AS affiliate_status, a.user_id AS affiliate_user_id,
            a.email AS affiliate_email, a.commission_rate, a.commission_months
     FROM suscripciones s
     LEFT JOIN affiliate_referrals r ON r.id = s.affiliate_referral_id
     LEFT JOIN affiliates a ON a.id = r.affiliate_id
     WHERE s.id_usuario = @userId
     LIMIT 1`,
    { userId },
  );

  const row = subscription.rows[0];
  if (!row?.referral_id || row.affiliate_status !== "ACTIVE") return null;
  if (row.affiliate_user_id && Number(row.affiliate_user_id) === Number(userId)) return null;

  const config = getAffiliateConfig();
  const months =
    row.commission_months === null || row.commission_months === undefined
      ? config.defaultCommissionMonths
      : Number(row.commission_months);
  const startDate = row.first_paid_at || row.created_at || row.attributed_at || paymentDate;
  const eligibleUntil = months > 0 ? addMonths(new Date(startDate), months) : new Date(paymentDate);
  if (months > 0 && new Date(paymentDate) > eligibleUntil) return null;

  const existing = await client.query(
    "SELECT id FROM affiliate_commissions WHERE paypal_transaction_id = @paypalTransactionId",
    { paypalTransactionId },
  );
  if (existing.rows.length > 0) return existing.rows[0];

  const commissionAmount = calculateCommissionAmount(grossAmount, row.commission_rate);
  const availableAt = new Date(paymentDate);
  availableAt.setDate(availableAt.getDate() + config.holdDays);

  const paymentNumber = await client.query(
    `SELECT COUNT(*)::int + 1 AS next_number
     FROM affiliate_commissions
     WHERE affiliate_referral_id = @referralId`,
    { referralId: row.referral_id },
  );

  const result = await client.query(
    `INSERT INTO affiliate_commissions
      (affiliate_id, affiliate_referral_id, referred_user_id, internal_subscription_id,
       paypal_subscription_id, paypal_transaction_id, paypal_webhook_event_id,
       gross_amount, currency, commission_rate, commission_amount, status,
       payment_number, eligible_until, available_at)
     VALUES
      (@affiliateId, @referralId, @userId, @subscriptionId,
       @paypalSubscriptionId, @paypalTransactionId, @paypalWebhookEventId,
       @grossAmount, @currency, @commissionRate, @commissionAmount, 'PENDING',
       @paymentNumber, @eligibleUntil, @availableAt)
     ON CONFLICT (paypal_transaction_id) WHERE paypal_transaction_id IS NOT NULL
     DO NOTHING
     RETURNING *`,
    {
      affiliateId: row.affiliate_id,
      referralId: row.referral_id,
      userId,
      subscriptionId: row.id,
      paypalSubscriptionId,
      paypalTransactionId,
      paypalWebhookEventId,
      grossAmount,
      currency: String(currency).toUpperCase(),
      commissionRate: row.commission_rate,
      commissionAmount,
      paymentNumber: paymentNumber.rows[0].next_number,
      eligibleUntil,
      availableAt,
    },
  );
  if (result.rows[0]) return result.rows[0];

  const duplicate = await client.query(
    "SELECT id FROM affiliate_commissions WHERE paypal_transaction_id = @paypalTransactionId",
    { paypalTransactionId },
  );
  return duplicate.rows[0] || null;
};

const reverseCommissionByTransaction = async ({
  client = db,
  paypalTransactionId,
  reason,
}) => {
  if (!paypalTransactionId) return null;
  const result = await client.query(
    `UPDATE affiliate_commissions
     SET status = CASE WHEN status IN ('PENDING', 'APPROVED', 'PAID') THEN 'REVERSED' ELSE status END,
         reversed_at = CASE WHEN status IN ('PENDING', 'APPROVED', 'PAID') THEN NOW() ELSE reversed_at END,
         reversal_reason = COALESCE(@reason, reversal_reason),
         updated_at = NOW()
     WHERE paypal_transaction_id = @paypalTransactionId
     RETURNING *`,
    { paypalTransactionId, reason },
  );
  if (result.rows[0]) {
    await createAuditLog({
      client,
      adminUserId: null,
      action: "COMMISSION_REVERSED",
      entityType: "affiliate_commission",
      entityId: result.rows[0].id,
      afterData: {
        status: result.rows[0].status,
        paid_at: result.rows[0].paid_at,
        reversed_at: result.rows[0].reversed_at,
        reversal_reason: result.rows[0].reversal_reason,
      },
    });
  }
  return result.rows[0] || null;
};

const getAffiliateStats = async (affiliateId) => {
  const result = await db.query(
    `SELECT
       a.*,
       COALESCE(c.total_clicks, 0)::int AS total_clicks,
       COALESCE(c.unique_clicks, 0)::int AS unique_clicks,
       COALESCE(r.registrations, 0)::int AS registrations,
       COALESCE(cm.paying_subscribers, 0)::int AS paying_subscribers,
       COALESCE(cm.gross_revenue, 0)::text AS gross_revenue,
       COALESCE(cm.pending_commission, 0)::text AS pending_commission,
       COALESCE(cm.available_commission, 0)::text AS available_commission,
       COALESCE(cm.approved_commission, 0)::text AS approved_commission,
       COALESCE(cm.paid_commission, 0)::text AS paid_commission,
       COALESCE(cm.reversed_commission, 0)::text AS reversed_commission
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
         SUM(CASE WHEN status = 'PENDING' AND available_at <= NOW() THEN commission_amount ELSE 0 END) AS available_commission,
         SUM(CASE WHEN status = 'APPROVED' THEN commission_amount ELSE 0 END) AS approved_commission,
         SUM(CASE WHEN status = 'PAID' THEN commission_amount ELSE 0 END) AS paid_commission,
         SUM(CASE WHEN status = 'REVERSED' THEN commission_amount ELSE 0 END) AS reversed_commission
       FROM affiliate_commissions WHERE affiliate_id = a.id
     ) cm ON TRUE
     WHERE a.id = @affiliateId
     GROUP BY a.id, c.total_clicks, c.unique_clicks, r.registrations,
              cm.paying_subscribers, cm.gross_revenue, cm.pending_commission,
              cm.available_commission, cm.approved_commission, cm.paid_commission,
              cm.reversed_commission`,
    { affiliateId },
  );
  const stats = result.rows[0];
  if (!stats) return null;
  const uniqueClicks = Number(stats.unique_clicks || 0);
  const registrations = Number(stats.registrations || 0);
  const payingSubscribers = Number(stats.paying_subscribers || 0);
  return {
    ...stats,
    conversion_click_to_registration: uniqueClicks === 0 ? 0 : (registrations / uniqueClicks) * 100,
    conversion_registration_to_payment: registrations === 0 ? 0 : (payingSubscribers / registrations) * 100,
  };
};

module.exports = {
  normalizeCode,
  normalizeEmail,
  hashSensitive,
  calculateCommissionAmount,
  addDecimalStrings,
  createAffiliate,
  updateAffiliate,
  getAffiliateByCode,
  recordAffiliateClick,
  createReferralForUser,
  attachReferralToSubscription,
  createCommissionForPayment,
  reverseCommissionByTransaction,
  getAffiliateStats,
  createAuditLog,
};
