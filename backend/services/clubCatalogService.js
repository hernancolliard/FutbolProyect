const crypto = require("crypto");

const CLUB_SEARCH_MIN_LENGTH = 2;
const CLUB_SEARCH_DEFAULT_LIMIT = 20;
const CLUB_SEARCH_MAX_LIMIT = 30;
const CUSTOM_CLUB_LOGO_MAX_BYTES = 5 * 1024 * 1024;
const CUSTOM_CLUB_LOGO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const normalizeSearchText = (value, maxLength) =>
  String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);

const normalizeClubSearchParams = (query = {}) => {
  const parsedLimit = Number.parseInt(query.limit, 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), CLUB_SEARCH_MAX_LIMIT)
    : CLUB_SEARCH_DEFAULT_LIMIT;

  return {
    q: normalizeSearchText(query.q, 100),
    country: normalizeSearchText(query.country, 120),
    limit,
  };
};

const validateCustomClubLogo = (file) => {
  if (!file) {
    const error = new Error("Seleccioná una imagen para el escudo.");
    error.statusCode = 400;
    throw error;
  }

  if (!CUSTOM_CLUB_LOGO_MIME_TYPES.has(file.mimetype)) {
    const error = new Error("El escudo debe ser PNG, JPG o WebP.");
    error.statusCode = 400;
    throw error;
  }

  if (!file.size || file.size > CUSTOM_CLUB_LOGO_MAX_BYTES) {
    const error = new Error("El escudo no puede superar los 5 MB.");
    error.statusCode = 400;
    throw error;
  }
};

const buildCustomClubLogoKey = (userId) =>
  `club-logos/custom/user-${userId}-${Date.now()}-${crypto.randomUUID()}.webp`;

module.exports = {
  CLUB_SEARCH_MIN_LENGTH,
  CUSTOM_CLUB_LOGO_MAX_BYTES,
  buildCustomClubLogoKey,
  normalizeClubSearchParams,
  validateCustomClubLogo,
};
