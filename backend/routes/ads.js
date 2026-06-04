const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/authMiddleware");

const VALID_PLACEMENTS = [
  "home_top",
  "home_middle",
  "home_profiles",
  "offers_top",
  "offers_inline",
  "profiles_top",
  "profiles_inline",
  "player_profile_sidebar",
  "footer",
];

const VALID_LANGUAGES = ["all", "es", "en"];
const VALID_LEAD_STATUSES = ["new", "contacted", "won", "lost", "archived"];

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeUrl = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const normalizeLanguage = (value) => {
  if (!value || typeof value !== "string") return "all";
  const lang = value.toLowerCase().slice(0, 2);
  return VALID_LANGUAGES.includes(lang) ? lang : "all";
};

const slugifyCampaign = (value) =>
  String(value || "futbolproyect-ad")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "futbolproyect-ad";

const buildTrackedUrl = (ad) => {
  const target = new URL(ad.target_url);
  if (!target.searchParams.has("utm_source")) {
    target.searchParams.set("utm_source", "futbolproyect");
  }
  if (!target.searchParams.has("utm_medium")) {
    target.searchParams.set("utm_medium", "sponsor_ad");
  }
  if (!target.searchParams.has("utm_campaign")) {
    target.searchParams.set("utm_campaign", slugifyCampaign(ad.title));
  }
  if (!target.searchParams.has("utm_content")) {
    target.searchParams.set("utm_content", ad.placement);
  }
  return target.toString();
};

const mapAdvertisementPayload = (body) => {
  const title = String(body.title || "").trim();
  const advertiser_name = String(body.advertiser_name || "").trim();
  const advertiser_type = String(body.advertiser_type || "sponsor").trim();
  const image_url = normalizeUrl(body.image_url);
  const target_url = normalizeUrl(body.target_url);
  const placement = String(body.placement || "").trim();
  const language = VALID_LANGUAGES.includes(String(body.language || "").toLowerCase())
    ? String(body.language).toLowerCase()
    : "all";
  const priority = Number.isFinite(Number(body.priority))
    ? parseInt(body.priority, 10)
    : 0;

  return {
    title,
    advertiser_name,
    advertiser_type,
    image_url,
    target_url,
    placement,
    language,
    country: body.country ? String(body.country).trim() : null,
    description: body.description ? String(body.description).trim() : null,
    button_text: body.button_text ? String(body.button_text).trim() : "Ver mas",
    package_type: body.package_type ? String(body.package_type).trim() : null,
    notes: body.notes ? String(body.notes).trim() : null,
    priority,
    is_active:
      typeof body.is_active === "boolean" ? body.is_active : body.is_active !== "false",
    start_date: body.start_date || null,
    end_date: body.end_date || null,
  };
};

const validateAdvertisement = (ad) => {
  if (!ad.title || !ad.advertiser_name || !ad.image_url || !ad.target_url || !ad.placement) {
    return "Titulo, anunciante, imagen, destino y ubicacion son obligatorios.";
  }
  if (!VALID_PLACEMENTS.includes(ad.placement)) {
    return "La ubicacion del anuncio no es valida.";
  }
  if (!isHttpUrl(ad.image_url)) {
    return "La imagen debe ser una URL http o https valida.";
  }
  if (!isHttpUrl(ad.target_url)) {
    return "El destino debe ser una URL http o https valida.";
  }
  if (ad.start_date && ad.end_date && new Date(ad.end_date) < new Date(ad.start_date)) {
    return "La fecha de fin no puede ser anterior a la fecha de inicio.";
  }
  return null;
};

// GET /api/ads?placement=home_middle&language=es
router.get("/", async (req, res) => {
  const placement = String(req.query.placement || "").trim();
  const language = normalizeLanguage(req.query.language);
  const limit = Math.min(parsePositiveInt(req.query.limit, 3), 12);

  if (!VALID_PLACEMENTS.includes(placement)) {
    return res.status(400).json({ message: "Ubicacion de anuncio no valida." });
  }

  try {
    const result = await db.query(
      `SELECT
        id,
        title,
        advertiser_name,
        advertiser_type,
        image_url,
        placement,
        language,
        country,
        description,
        button_text,
        priority
      FROM advertisements
      WHERE placement = @placement
        AND is_active = TRUE
        AND (language = 'all' OR language = @language)
        AND (start_date IS NULL OR start_date <= CURRENT_DATE)
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      ORDER BY priority DESC, id DESC
      LIMIT @limit`,
      { placement, language, limit },
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// POST /api/ads/:id/impression
router.post("/:id/impression", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "ID invalido." });
  }

  try {
    await db.query(
      "UPDATE advertisements SET impressions_count = impressions_count + 1, updated_at = NOW() WHERE id = @id",
      { id },
    );
    res.status(204).send();
  } catch (error) {
    console.error("Error tracking advertisement impression:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// GET /api/ads/:id/click
router.get("/:id/click", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "ID invalido." });
  }

  try {
    const result = await db.query(
      `UPDATE advertisements
       SET clicks_count = clicks_count + 1, updated_at = NOW()
       WHERE id = @id
         AND is_active = TRUE
         AND (start_date IS NULL OR start_date <= CURRENT_DATE)
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       RETURNING id, title, placement, target_url`,
      { id },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Anuncio no encontrado." });
    }

    res.redirect(302, buildTrackedUrl(result.rows[0]));
  } catch (error) {
    console.error("Error tracking advertisement click:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// POST /api/ads/leads
router.post("/leads", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const message = String(req.body.message || "").trim();
  const website = normalizeUrl(req.body.website || "");

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Nombre, email y mensaje son obligatorios." });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ message: "Email invalido." });
  }
  if (website && !isHttpUrl(website)) {
    return res.status(400).json({ message: "El sitio web debe comenzar con http:// o https://." });
  }

  try {
    const result = await db.query(
      `INSERT INTO advertising_leads (
        name, company, email, phone, website, advertiser_type, budget, message
      ) VALUES (
        @name, @company, @email, @phone, @website, @advertiser_type, @budget, @message
      )
      RETURNING id, status, created_at`,
      {
        name,
        company: req.body.company ? String(req.body.company).trim() : null,
        email,
        phone: req.body.phone ? String(req.body.phone).trim() : null,
        website: website || null,
        advertiser_type: req.body.advertiser_type
          ? String(req.body.advertiser_type).trim()
          : null,
        budget: req.body.budget ? String(req.body.budget).trim() : null,
        message,
      },
    );

    res.status(201).json({
      message: "Consulta recibida correctamente.",
      lead: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating advertising lead:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// GET /api/ads/admin/advertisements
router.get(
  "/admin/advertisements",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT *,
          CASE
            WHEN impressions_count > 0
              THEN ROUND((clicks_count::numeric / impressions_count::numeric) * 100, 2)
            ELSE 0
          END AS ctr
        FROM advertisements
        ORDER BY created_at DESC`,
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching admin advertisements:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

// POST /api/ads/admin/advertisements
router.post(
  "/admin/advertisements",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const ad = mapAdvertisementPayload(req.body);
    const validationError = validateAdvertisement(ad);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const result = await db.query(
        `INSERT INTO advertisements (
          title, advertiser_name, advertiser_type, image_url, target_url,
          placement, language, country, description, button_text, package_type,
          notes, priority, is_active, start_date, end_date
        ) VALUES (
          @title, @advertiser_name, @advertiser_type, @image_url, @target_url,
          @placement, @language, @country, @description, @button_text,
          @package_type, @notes, @priority, @is_active, @start_date, @end_date
        )
        RETURNING *`,
        ad,
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating advertisement:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

// PUT /api/ads/admin/advertisements/:id
router.put(
  "/admin/advertisements/:id",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const ad = mapAdvertisementPayload(req.body);
    const validationError = validateAdvertisement(ad);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID invalido." });
    }
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const result = await db.query(
        `UPDATE advertisements SET
          title = @title,
          advertiser_name = @advertiser_name,
          advertiser_type = @advertiser_type,
          image_url = @image_url,
          target_url = @target_url,
          placement = @placement,
          language = @language,
          country = @country,
          description = @description,
          button_text = @button_text,
          package_type = @package_type,
          notes = @notes,
          priority = @priority,
          is_active = @is_active,
          start_date = @start_date,
          end_date = @end_date,
          updated_at = NOW()
        WHERE id = @id
        RETURNING *`,
        { ...ad, id },
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Anuncio no encontrado." });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating advertisement:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

// PATCH /api/ads/admin/advertisements/:id/toggle
router.patch(
  "/admin/advertisements/:id/toggle",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID invalido." });
    }

    try {
      const result = await db.query(
        `UPDATE advertisements
         SET is_active = NOT is_active, updated_at = NOW()
         WHERE id = @id
         RETURNING *`,
        { id },
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Anuncio no encontrado." });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error toggling advertisement:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

// DELETE /api/ads/admin/advertisements/:id
router.delete(
  "/admin/advertisements/:id",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID invalido." });
    }

    try {
      await db.query("DELETE FROM advertisements WHERE id = @id", { id });
      res.json({ message: "Anuncio eliminado correctamente." });
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

// GET /api/ads/admin/leads
router.get("/admin/leads", [verificarToken, verificarAdmin], async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM advertising_leads ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching advertising leads:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// PATCH /api/ads/admin/leads/:id/status
router.patch(
  "/admin/leads/:id/status",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const status = String(req.body.status || "").trim();

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID invalido." });
    }
    if (!VALID_LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Estado no valido." });
    }

    try {
      const result = await db.query(
        `UPDATE advertising_leads
         SET status = @status, updated_at = NOW()
         WHERE id = @id
         RETURNING *`,
        { id, status },
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Consulta no encontrada." });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating advertising lead:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

// DELETE /api/ads/admin/leads/:id
router.delete(
  "/admin/leads/:id",
  [verificarToken, verificarAdmin],
  async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "ID invalido." });
    }

    try {
      await db.query("DELETE FROM advertising_leads WHERE id = @id", { id });
      res.json({ message: "Consulta eliminada correctamente." });
    } catch (error) {
      console.error("Error deleting advertising lead:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  },
);

module.exports = router;
