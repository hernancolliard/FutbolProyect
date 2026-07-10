const getIntEnv = (name, fallback) => {
  const raw = process.env[name];
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getDecimalEnv = (name, fallback) => {
  const raw = process.env[name];
  return raw && /^\d+(\.\d{1,4})?$/.test(raw) ? raw : fallback;
};

const getAffiliateConfig = () => ({
  cookieName: "fp_affiliate_ref",
  cookieSecret:
    process.env.AFFILIATE_COOKIE_SECRET ||
    process.env.JWT_SECRET ||
    "development-affiliate-cookie-secret",
  cookieDays: getIntEnv("AFFILIATE_COOKIE_DAYS", 60),
  holdDays: getIntEnv("AFFILIATE_HOLD_DAYS", 30),
  defaultCommissionRate: getDecimalEnv(
    "AFFILIATE_DEFAULT_COMMISSION_RATE",
    "20",
  ),
  minimumPayout: getDecimalEnv("AFFILIATE_MINIMUM_PAYOUT", "20"),
  defaultCommissionMonths: getIntEnv("AFFILIATE_DEFAULT_COMMISSION_MONTHS", 6),
});

module.exports = { getAffiliateConfig };
