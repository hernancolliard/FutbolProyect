const crypto = require("crypto");
const { getAffiliateConfig } = require("./affiliateConfig");

const base64url = (value) =>
  Buffer.from(value).toString("base64url");

const fromBase64url = (value) =>
  Buffer.from(value, "base64url").toString("utf8");

const signPayload = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("base64url");

const createAffiliateCookieValue = ({
  affiliateId,
  clickId,
  issuedAt = Date.now(),
  maxAgeDays,
}) => {
  const config = getAffiliateConfig();
  const expiresAt = issuedAt + (maxAgeDays || config.cookieDays) * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({
    affiliateId,
    clickId: clickId || null,
    issuedAt,
    expiresAt,
  });
  const encoded = base64url(payload);
  const signature = signPayload(encoded, config.cookieSecret);
  return `${encoded}.${signature}`;
};

const verifyAffiliateCookieValue = (cookieValue, now = Date.now()) => {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const [encoded, signature] = cookieValue.split(".");
  if (!encoded || !signature) return null;

  const config = getAffiliateConfig();
  const expected = signPayload(encoded, config.cookieSecret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64url(encoded));
    if (!payload.affiliateId || !payload.expiresAt || payload.expiresAt < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const getAffiliateCookieOptions = (maxAgeDays) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: (maxAgeDays || getAffiliateConfig().cookieDays) * 24 * 60 * 60 * 1000,
  ...(process.env.NODE_ENV === 'production' ? { sameSite: 'none' } : {}),
});

const setAffiliateCookie = (res, value, maxAgeDays) => {
  res.cookie(getAffiliateConfig().cookieName, value, getAffiliateCookieOptions(maxAgeDays));
};

const clearAffiliateCookie = (res) => {
  res.clearCookie(getAffiliateConfig().cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

const readAffiliateCookie = (req) =>
  verifyAffiliateCookieValue(req.cookies?.[getAffiliateConfig().cookieName]);

module.exports = {
  createAffiliateCookieValue,
  verifyAffiliateCookieValue,
  setAffiliateCookie,
  clearAffiliateCookie,
  readAffiliateCookie,
};
