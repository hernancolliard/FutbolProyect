const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const db = require("../db");
const { verificarToken } = require("../middleware/authMiddleware");
const { uploadToS3 } = require("../services/s3Service");
const {
  CLUB_SEARCH_MIN_LENGTH,
  CUSTOM_CLUB_LOGO_MAX_BYTES,
  buildCustomClubLogoKey,
  normalizeClubSearchParams,
  validateCustomClubLogo,
} = require("../services/clubCatalogService");

const router = express.Router();
const customLogoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CUSTOM_CLUB_LOGO_MAX_BYTES },
}).single("logo");

const receiveCustomLogo = (req, res, next) => {
  customLogoUpload(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "El escudo no puede superar los 5 MB." });
    }
    return res.status(400).json({ message: "No se pudo leer el archivo del escudo." });
  });
};

router.get("/", async (req, res) => {
  try {
    const { q, country, limit } = normalizeClubSearchParams(req.query);
    if (q.length < CLUB_SEARCH_MIN_LENGTH) {
      return res.json([]);
    }

    const countryClause = country ? "AND country ILIKE @country" : "";
    const result = await db.query(
      `SELECT id, name, country, country_slug, league, logo_url
       FROM football_clubs
       WHERE is_active = TRUE
         AND name ILIKE @contains
         ${countryClause}
       ORDER BY
         CASE
           WHEN LOWER(name) = LOWER(@exact) THEN 0
           WHEN LOWER(name) LIKE LOWER(@prefix) THEN 1
           ELSE 2
         END,
         name ASC
       LIMIT @limit`,
      {
        contains: `%${q}%`,
        exact: q,
        prefix: `${q}%`,
        country: country || null,
        limit,
      },
    );

    return res.json(
      result.rows.map((club) => ({
        ...club,
        id: Number(club.id),
      })),
    );
  } catch (error) {
    console.error("Error buscando clubes:", error);
    return res.status(500).json({ message: "No se pudo buscar clubes." });
  }
});

router.post(
  "/custom-logo",
  verificarToken,
  receiveCustomLogo,
  async (req, res) => {
    try {
      validateCustomClubLogo(req.file);

      const processedImageBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize(256, 256, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          withoutEnlargement: true,
        })
        .webp({ quality: 88 })
        .toBuffer();

      const key = buildCustomClubLogoKey(req.user.id);
      const logoUrl = await uploadToS3(processedImageBuffer, key, "image/webp");

      return res.status(201).json({ logo_url: logoUrl });
    } catch (error) {
      console.error("Error subiendo escudo personalizado:", error);
      return res.status(error.statusCode || 500).json({
        message: error.statusCode
          ? error.message
          : "No se pudo subir el escudo personalizado.",
      });
    }
  },
);

module.exports = router;
