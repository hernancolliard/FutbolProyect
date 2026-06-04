const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verificarToken,
  popularRolUsuario,
} = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { z } = require("zod");
const upload = require("../middleware/upload");
const path = require("path");
const sharp = require("sharp");
const { translateText } = require("../services/translationService");
const fs = require("fs");

const { uploadToS3 } = require("../services/s3Service");

const MAX_SCOUTING_REPORTS = 3;
const MAX_SCOUTING_REPORT_IMAGES = 15;
const PROFILE_POSITION_OPTIONS = ["Arquero", "Defensa", "Centrocampista", "Delantero"];
const PROFILE_POSITION_FILTERS = {
  Arquero: ["arquero", "portero", "goalkeeper"],
  Defensa: ["defensa", "defensor", "lateral", "central"],
  Centrocampista: [
    "centrocampista",
    "mediocampista",
    "medio",
    "volante",
    "pivote",
    "enganche",
  ],
  Delantero: ["delantero", "atacante", "extremo", "punta", "wing"],
};

const buildProfilePositionFilterClause = (column, position) => {
  const terms = Object.prototype.hasOwnProperty.call(
    PROFILE_POSITION_FILTERS,
    position
  )
    ? PROFILE_POSITION_FILTERS[position]
    : null;

  if (!terms) {
    return null;
  }

  return `(${terms
    .map((term) => `${column} ILIKE '%${term}%'`)
    .join(" OR ")})`;
};

const MANAGED_PROFILE_ROLES = ["club", "agente", "scout"];

const canManagePlayerProfiles = async (userId) => {
  const result = await db.query(
    "SELECT tipo_usuario, rol, isadmin FROM usuarios WHERE id = @userId",
    { userId }
  );

  const user = result.rows[0];
  if (!user) return false;

  return (
    user.isadmin ||
    (user.tipo_usuario === "ofertante" &&
      MANAGED_PROFILE_ROLES.includes(user.rol))
  );
};

const getManagedProfileIdFromSlug = (value) => {
  if (typeof value !== "string" || !value.startsWith("managed-")) {
    return null;
  }

  const id = parseInt(value.replace("managed-", ""), 10);
  return Number.isNaN(id) ? null : id;
};

const buildManagedProfilePayload = (body) => ({
  nombre: body.nombre?.trim(),
  apellido: body.apellido?.trim() || null,
  email: body.email?.trim() || null,
  telefono: body.telefono?.trim() || null,
  nacionalidad: body.nacionalidad?.trim() || null,
  posicion_principal: body.posicion_principal?.trim() || null,
  resumen_profesional: body.resumen_profesional?.trim() || null,
  cv_url: body.cv_url?.trim() || null,
  linkedin_url: body.linkedin_url?.trim() || null,
  instagram_url: body.instagram_url?.trim() || null,
  youtube_url: body.youtube_url?.trim() || null,
  transfermarkt_url: body.transfermarkt_url?.trim() || null,
  whatsapp_url: body.whatsapp_url?.trim() || null,
  altura_cm: body.altura_cm || null,
  peso_kg: body.peso_kg || null,
  pie_dominante: body.pie_dominante?.trim() || null,
  fecha_de_nacimiento: body.fecha_de_nacimiento || null,
});

const buildManagedProfileResponseSelect = () => `
  SELECT
    'managed-' || mp.id AS id,
    mp.id AS managed_profile_id,
    mp.owner_user_id,
    TRUE AS is_managed_profile,
    mp.nombre,
    mp.apellido,
    mp.email,
    'postulante' AS tipo_usuario,
    'jugador' AS rol,
    COALESCE(mp.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
    mp.telefono,
    mp.nacionalidad,
    mp.resumen_profesional,
    mp.cv_url,
    mp.posicion_principal,
    mp.linkedin_url,
    mp.instagram_url,
    mp.youtube_url,
    mp.transfermarkt_url,
    mp.whatsapp_url,
    mp.altura_cm,
    mp.peso_kg,
    mp.pie_dominante,
    mp.fecha_de_nacimiento,
    mp.average_rating,
    mp.total_ratings,
    mp.profile_views,
    mp.resumen_profesional_es,
    mp.resumen_profesional_en,
    mp.posicion_principal_es,
    mp.posicion_principal_en,
    mp.nacionalidad_es,
    mp.nacionalidad_en,
    mp.pie_dominante_es,
    mp.pie_dominante_en,
    s.plan as subscription_plan,
    s.fecha_fin as subscription_end_date,
    s.estado as subscription_status
  FROM managed_player_profiles mp
  JOIN usuarios owner ON owner.id = mp.owner_user_id
  LEFT JOIN suscripciones s ON owner.id = s.id_usuario
`;

// Helper para construir la URL completa
const getFullUrl = (req, filePath) => {
  return `${req.protocol}://${req.get("host")}/${filePath}`;
};

// --- RUTA PÚBLICA: OBTENER TODOS LOS PERFILES (CON FILTROS) ---
router.get("/", async (req, res) => {
  const { nacionalidad, puesto } = req.query;

  try {
    let queryParams = {};
    let userWhereClauses = ["u.tipo_usuario = 'postulante'"];
    let managedWhereClauses = [
      "owner.tipo_usuario = 'ofertante'",
      "owner.rol = ANY(@managedRoles::text[])",
    ];
    queryParams.managedRoles = MANAGED_PROFILE_ROLES;

    if (nacionalidad) {
      queryParams.nacionalidad = nacionalidad;
      userWhereClauses.push(`p.nacionalidad = @nacionalidad`);
      managedWhereClauses.push(`mp.nacionalidad = @nacionalidad`);
    }
    if (puesto) {
      const userPositionFilterClause = buildProfilePositionFilterClause(
        "p.posicion_principal",
        puesto
      );
      const managedPositionFilterClause = buildProfilePositionFilterClause(
        "mp.posicion_principal",
        puesto
      );

      if (userPositionFilterClause && managedPositionFilterClause) {
        userWhereClauses.push(userPositionFilterClause);
        managedWhereClauses.push(managedPositionFilterClause);
      }
    }

    const query = `
      SELECT *
      FROM (
        SELECT
          u.id::text AS id,
          NULL::int AS managed_profile_id,
          NULL::int AS owner_user_id,
          FALSE AS is_managed_profile,
          u.nombre,
          u.apellido,
          u.email,
          u.tipo_usuario,
          COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          p.posicion_principal,
          p.nacionalidad,
          p.average_rating,
          p.total_ratings
        FROM usuarios u
        LEFT JOIN perfiles_usuario p ON u.id = p.id_usuario
        WHERE ${userWhereClauses.join(" AND ")}

        UNION ALL

        SELECT
          'managed-' || mp.id AS id,
          mp.id AS managed_profile_id,
          mp.owner_user_id,
          TRUE AS is_managed_profile,
          mp.nombre,
          mp.apellido,
          mp.email,
          'postulante' AS tipo_usuario,
          COALESCE(mp.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          mp.posicion_principal,
          mp.nacionalidad,
          mp.average_rating,
          mp.total_ratings
        FROM managed_player_profiles mp
        JOIN usuarios owner ON owner.id = mp.owner_user_id
        WHERE ${managedWhereClauses.join(" AND ")}
      ) profiles
      ORDER BY id DESC;
    `;

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener todos los perfiles:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});




// --- RUTA PÚBLICA: OBTENER PERFILES DESTACADOS ---
router.get("/featured", async (req, res) => {
  const { nacionalidad, puesto } = req.query;

  try {
    let queryParams = { managedRoles: MANAGED_PROFILE_ROLES };
    let userWhereClauses = ["u.tipo_usuario = 'postulante'", "s.estado = 'activa'"];
    let managedWhereClauses = [
      "owner.tipo_usuario = 'ofertante'",
      "owner.rol = ANY(@managedRoles::text[])",
      "s.estado = 'activa'",
    ];

    if (nacionalidad) {
      queryParams.nacionalidad = nacionalidad;
      userWhereClauses.push("p.nacionalidad = @nacionalidad");
      managedWhereClauses.push("mp.nacionalidad = @nacionalidad");
    }

    if (puesto) {
      const userPositionFilterClause = buildProfilePositionFilterClause(
        "p.posicion_principal",
        puesto
      );
      const managedPositionFilterClause = buildProfilePositionFilterClause(
        "mp.posicion_principal",
        puesto
      );

      if (userPositionFilterClause && managedPositionFilterClause) {
        userWhereClauses.push(userPositionFilterClause);
        managedWhereClauses.push(managedPositionFilterClause);
      }
    }

    const query = `
      SELECT *
      FROM (
        SELECT
          u.id::text AS id,
          NULL::int AS managed_profile_id,
          NULL::int AS owner_user_id,
          FALSE AS is_managed_profile,
          u.nombre,
          u.apellido,
          u.email,
          u.tipo_usuario,
          COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          p.posicion_principal,
          p.nacionalidad,
          p.average_rating,
          p.total_ratings,
          s.fecha_fin
        FROM usuarios u
        JOIN perfiles_usuario p ON u.id = p.id_usuario
        LEFT JOIN suscripciones s ON u.id = s.id_usuario
        WHERE ${userWhereClauses.join(" AND ")}

        UNION ALL

        SELECT
          'managed-' || mp.id AS id,
          mp.id AS managed_profile_id,
          mp.owner_user_id,
          TRUE AS is_managed_profile,
          mp.nombre,
          mp.apellido,
          mp.email,
          'postulante' AS tipo_usuario,
          COALESCE(mp.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          mp.posicion_principal,
          mp.nacionalidad,
          mp.average_rating,
          mp.total_ratings,
          s.fecha_fin
        FROM managed_player_profiles mp
        JOIN usuarios owner ON owner.id = mp.owner_user_id
        LEFT JOIN suscripciones s ON owner.id = s.id_usuario
        WHERE ${managedWhereClauses.join(" AND ")}
      ) profiles
      ORDER BY
        COALESCE(average_rating, 0) DESC,
        COALESCE(total_ratings, 0) DESC,
        fecha_fin DESC;
    `;

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los perfiles destacados:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.get("/featured-legacy-disabled", async (req, res) => {
      const { nacionalidad, puesto } = req.query;
  
    try {
      let queryParams = {}; // Usar un objeto para los parámetros nombrados
      let whereClauses = ["u.tipo_usuario = 'postulante'", "s.estado = 'activa'"];
  
      if (nacionalidad) {
        queryParams.nacionalidad = nacionalidad;
        whereClauses.push(`p.nacionalidad = @nacionalidad`);
      }
      if (puesto) {
        const positionFilterClause = buildProfilePositionFilterClause(
          "p.posicion_principal",
          puesto
        );

        if (positionFilterClause) {
          whereClauses.push(positionFilterClause);
        }
      }
  
      const query = `
        SELECT
            u.id,          u.nombre,
          u.apellido,
          COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          p.posicion_principal,
          p.nacionalidad,
          p.average_rating, -- Añadir calificación promedio
          p.total_ratings -- Añadir conteo total de calificaciones
      FROM
          usuarios u
      JOIN
          perfiles_usuario p ON u.id = p.id_usuario
      LEFT JOIN
          suscripciones s ON u.id = s.id_usuario
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY
          COALESCE(p.average_rating, 0) DESC,
          COALESCE(p.total_ratings, 0) DESC,
          s.fecha_fin DESC; -- Luego por fecha de fin de suscripción
    `;

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los perfiles destacados:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});


// RUTA PÚBLICA: OBTENER TODAS LAS NACIONALIDADES ÚNICAS
router.get('/nacionalidades', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT nacionalidad
      FROM (
        SELECT nacionalidad FROM perfiles_usuario WHERE nacionalidad IS NOT NULL
        UNION
        SELECT nacionalidad FROM managed_player_profiles WHERE nacionalidad IS NOT NULL
      ) nacionalidades
      ORDER BY nacionalidad ASC
    `;
    const result = await db.query(query);
    res.json(result.rows.map(row => row.nacionalidad));
  } catch (error) {
    console.error('Error al obtener las nacionalidades:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// RUTA PÚBLICA: OBTENER TODOS LOS PUESTOS ÚNICOS
router.get('/puestos', async (req, res) => {
  res.json(PROFILE_POSITION_OPTIONS);
});

router.get("/managed/me", verificarToken, async (req, res) => {
  try {
    const allowed = await canManagePlayerProfiles(req.user.id);

    if (!allowed) {
      return res.status(403).json({
        message: "Solo clubes, agentes o scouts pueden gestionar perfiles de jugadores.",
      });
    }

    const result = await db.query(
      `
        ${buildManagedProfileResponseSelect()}
        WHERE mp.owner_user_id = @userId
        ORDER BY mp.created_at DESC;
      `,
      { userId: req.user.id }
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener perfiles gestionados:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

router.post(
  "/managed",
  verificarToken,
  upload.single("foto_perfil"),
  async (req, res) => {
    try {
      const allowed = await canManagePlayerProfiles(req.user.id);

      if (!allowed) {
        return res.status(403).json({
          message: "Solo clubes, agentes o scouts pueden gestionar perfiles de jugadores.",
        });
      }

      const payload = buildManagedProfilePayload(req.body);

      if (!payload.nombre) {
        return res.status(400).json({ message: "El nombre del jugador es obligatorio." });
      }

      if (
        payload.posicion_principal &&
        !PROFILE_POSITION_OPTIONS.includes(payload.posicion_principal)
      ) {
        return res.status(400).json({
          message:
            "La posiciÃ³n principal debe ser Arquero, Defensa, Centrocampista o Delantero.",
        });
      }

      let fotoPerfilUrl = null;
      if (req.file) {
        const processedImageBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize(300, 300, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `managed-player-profiles/profile-${req.user.id}-${Date.now()}.webp`;
        fotoPerfilUrl = await uploadToS3(processedImageBuffer, key, "image/webp");
      }

      const result = await db.query(
        `
          INSERT INTO managed_player_profiles (
            owner_user_id, nombre, apellido, email, foto_perfil_url, telefono,
            nacionalidad, resumen_profesional, cv_url, posicion_principal,
            linkedin_url, instagram_url, youtube_url, transfermarkt_url,
            whatsapp_url, altura_cm, peso_kg, pie_dominante, fecha_de_nacimiento
          )
          VALUES (
            @ownerUserId, @nombre, @apellido, @email, @fotoPerfilUrl, @telefono,
            @nacionalidad, @resumen_profesional, @cv_url, @posicion_principal,
            @linkedin_url, @instagram_url, @youtube_url, @transfermarkt_url,
            @whatsapp_url, @altura_cm, @peso_kg, @pie_dominante, @fecha_de_nacimiento
          )
          RETURNING id;
        `,
        {
          ownerUserId: req.user.id,
          fotoPerfilUrl,
          ...payload,
        }
      );

      const profileResult = await db.query(
        `
          ${buildManagedProfileResponseSelect()}
          WHERE mp.id = @profileId;
        `,
        { profileId: result.rows[0].id }
      );

      res.status(201).json(profileResult.rows[0]);
    } catch (error) {
      console.error("Error al crear perfil gestionado:", error);
      res.status(500).json({ message: "Error del servidor al crear el perfil." });
    }
  }
);

router.put(
  "/managed/:profileId",
  verificarToken,
  upload.single("foto_perfil"),
  async (req, res) => {
    const profileId = parseInt(req.params.profileId, 10);

    if (Number.isNaN(profileId)) {
      return res.status(400).json({ message: "El ID de perfil no es vÃ¡lido." });
    }

    try {
      const allowed = await canManagePlayerProfiles(req.user.id);

      if (!allowed) {
        return res.status(403).json({
          message: "Solo clubes, agentes o scouts pueden gestionar perfiles de jugadores.",
        });
      }

      const existing = await db.query(
        "SELECT id FROM managed_player_profiles WHERE id = @profileId AND owner_user_id = @userId",
        { profileId, userId: req.user.id }
      );

      if (existing.rows.length === 0 && !req.user.isadmin) {
        return res.status(404).json({ message: "Perfil no encontrado." });
      }

      const payload = buildManagedProfilePayload(req.body);

      if (!payload.nombre) {
        return res.status(400).json({ message: "El nombre del jugador es obligatorio." });
      }

      if (
        payload.posicion_principal &&
        !PROFILE_POSITION_OPTIONS.includes(payload.posicion_principal)
      ) {
        return res.status(400).json({
          message:
            "La posiciÃ³n principal debe ser Arquero, Defensa, Centrocampista o Delantero.",
        });
      }

      let fotoPerfilUrl = null;
      if (req.file) {
        const processedImageBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize(300, 300, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `managed-player-profiles/profile-${profileId}-${Date.now()}.webp`;
        fotoPerfilUrl = await uploadToS3(processedImageBuffer, key, "image/webp");
      }

      await db.query(
        `
          UPDATE managed_player_profiles
          SET
            nombre = @nombre,
            apellido = @apellido,
            email = @email,
            foto_perfil_url = COALESCE(@fotoPerfilUrl, foto_perfil_url),
            telefono = @telefono,
            nacionalidad = @nacionalidad,
            resumen_profesional = @resumen_profesional,
            cv_url = @cv_url,
            posicion_principal = @posicion_principal,
            linkedin_url = @linkedin_url,
            instagram_url = @instagram_url,
            youtube_url = @youtube_url,
            transfermarkt_url = @transfermarkt_url,
            whatsapp_url = @whatsapp_url,
            altura_cm = @altura_cm,
            peso_kg = @peso_kg,
            pie_dominante = @pie_dominante,
            fecha_de_nacimiento = @fecha_de_nacimiento,
            updated_at = NOW()
          WHERE id = @profileId
            AND (owner_user_id = @userId OR @isAdmin = TRUE);
        `,
        {
          profileId,
          userId: req.user.id,
          isAdmin: Boolean(req.user.isadmin),
          fotoPerfilUrl,
          ...payload,
        }
      );

      const profileResult = await db.query(
        `
          ${buildManagedProfileResponseSelect()}
          WHERE mp.id = @profileId;
        `,
        { profileId }
      );

      res.json(profileResult.rows[0]);
    } catch (error) {
      console.error("Error al actualizar perfil gestionado:", error);
      res.status(500).json({ message: "Error del servidor al actualizar el perfil." });
    }
  }
);


// --- RUTA PÚBLICA: OBTENER PERFIL DE USUARIO ---
// --- RUTA PROTEGIDA: MÉTRICAS DEL PERFIL ---
router.get("/:userId/stats", verificarToken, async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user.id;
  const isAdmin = req.user.isadmin;

  if (requesterId !== parseInt(userId, 10) && !isAdmin) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para ver estas métricas." });
  }

  try {
    const statsQuery = `
      SELECT
        u.id,
        u.tipo_usuario,
        COALESCE(u.profile_views, 0) AS profile_views,
        p.foto_perfil_url,
        p.telefono,
        p.nacionalidad,
        p.resumen_profesional,
        p.cv_url,
        p.posicion_principal,
        p.youtube_url,
        p.transfermarkt_url,
        p.whatsapp_url,
        p.altura_cm,
        p.peso_kg,
        p.pie_dominante,
        p.fecha_de_nacimiento,
        COALESCE(p.average_rating, 0) AS average_rating,
        COALESCE(p.total_ratings, 0) AS total_ratings,
        (
          SELECT COUNT(*)
          FROM postulaciones po
          WHERE po.id_usuario_postulante = u.id
        ) AS applications_sent,
        (
          SELECT COUNT(*)
          FROM ofertas_laborales o
          WHERE o.id_usuario_ofertante = u.id
        ) AS offers_published,
        (
          SELECT COUNT(*)
          FROM ofertas_laborales o
          JOIN postulaciones po ON po.id_oferta = o.id
          WHERE o.id_usuario_ofertante = u.id
        ) AS applications_received
      FROM usuarios u
      LEFT JOIN perfiles_usuario p ON u.id = p.id_usuario
      WHERE u.id = @userId;
    `;

    const result = await db.query(statsQuery, { userId: parseInt(userId, 10) });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const stats = result.rows[0];
    const completionFields = [
      "foto_perfil_url",
      "telefono",
      "nacionalidad",
      "resumen_profesional",
      "cv_url",
      "posicion_principal",
      "altura_cm",
      "peso_kg",
      "pie_dominante",
      "fecha_de_nacimiento",
    ];
    const completedFields = completionFields.filter((field) => Boolean(stats[field]));

    res.json({
      profile_views: Number(stats.profile_views || 0),
      applications_sent: Number(stats.applications_sent || 0),
      offers_published: Number(stats.offers_published || 0),
      applications_received: Number(stats.applications_received || 0),
      average_rating: Number(stats.average_rating || 0),
      total_ratings: Number(stats.total_ratings || 0),
      completion_percent: Math.round(
        (completedFields.length / completionFields.length) * 100,
      ),
      missing_fields: completionFields.filter((field) => !stats[field]),
    });
  } catch (error) {
    console.error("Error al obtener métricas del perfil:", error);
    res.status(500).json({ message: "Error del servidor al obtener métricas." });
  }
});

// --- RUTA PROTEGIDA: OBTENER MI CALIFICACIÓN PARA UN PERFIL ---
router.get("/:profileId/my-rating", verificarToken, async (req, res) => {
  const { profileId } = req.params;
  const userId = req.user.id;

  if (isNaN(parseInt(profileId, 10))) {
    return res.status(400).json({ message: "El ID de perfil no es válido." });
  }

  try {
    const result = await db.query(
      `
        SELECT rating
        FROM profile_ratings
        WHERE profile_id = @profileId AND user_id = @userId;
      `,
      { profileId: parseInt(profileId, 10), userId },
    );

    res.json({
      rating: result.rows.length > 0 ? result.rows[0].rating : null,
    });
  } catch (error) {
    console.error("Error al obtener la calificación del usuario:", error);
    res.status(500).json({ message: "Error del servidor al obtener la calificación." });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  // Validar que userId sea un número
  const managedProfileId = getManagedProfileIdFromSlug(userId);

  if (managedProfileId) {
    try {
      const result = await db.query(
        `
          ${buildManagedProfileResponseSelect()}
          WHERE mp.id = @profileId;
        `,
        { profileId: managedProfileId }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Perfil no encontrado." });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener el perfil gestionado:", error);
      return res.status(500).json({ message: "Error del servidor." });
    }
  }

  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "El ID de usuario debe ser un número válido." });
  }

  const userIdNum = parseInt(userId, 10); // Convertir a número una vez validado

  try {
    const query = `
      SELECT u.*, COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url, p.telefono, p.nacionalidad, p.resumen_profesional, p.cv_url, p.posicion_principal, p.linkedin_url, p.instagram_url, p.youtube_url, p.transfermarkt_url, p.whatsapp_url, p.altura_cm, p.peso_kg, p.pie_dominante, p.fecha_de_nacimiento,
             p.average_rating, p.total_ratings, -- Añadir calificación al SELECT
             s.plan as subscription_plan,
             s.fecha_fin as subscription_end_date,
             s.estado as subscription_status
      FROM usuarios u
      LEFT JOIN perfiles_usuario p ON u.id = p.id_usuario
      LEFT JOIN suscripciones s ON u.id = s.id_usuario
      WHERE u.id = @userId;
    `;
    const result = await db.query(query, { userId: userIdNum }); // Usar userIdNum aquí

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const userProfile = result.rows[0];

    res.json(userProfile);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// --- RUTA PARA REGISTRAR UNA VISTA DE PERFIL ---
router.post('/:userId/view', async (req, res) => {
  const { userId } = req.params;
  try {
    const managedProfileId = getManagedProfileIdFromSlug(userId);

    if (managedProfileId) {
      await db.query(
        `
          UPDATE managed_player_profiles
          SET profile_views = COALESCE(profile_views, 0) + 1
          WHERE id = @profileId;
        `,
        { profileId: managedProfileId }
      );
      return res.status(204).send();
    }

    const query = `
      UPDATE usuarios
      SET profile_views = COALESCE(profile_views, 0) + 1
      WHERE id = @userId;
    `;
    await db.query(query, { userId });
    res.status(204).send(); // No content
  } catch (error) {
    // No enviar un error al cliente, solo registrarlo en el servidor
    // para no interrumpir la experiencia del usuario si esto falla.
    console.error(`Failed to record profile view for user ${userId}:`, error);
    res.status(500).send(); // Enviar una respuesta para cerrar la conexión
  }
});

// ... (Otras rutas existentes)

// --- RUTA PROTEGIDA: CALIFICAR UN PERFIL ---
router.post("/:profileId/rate", verificarToken, async (req, res) => {
  const { profileId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id; // Usuario autenticado realizando la calificación

  if (isNaN(parseInt(profileId, 10))) {
    return res.status(400).json({ message: "El ID de perfil no es válido." });
  }

  const profileIdNum = parseInt(profileId, 10);

  // No permitir que un usuario califique su propio perfil
  if (userId === profileIdNum) {
    return res
      .status(403)
      .json({ message: "No puedes calificar tu propio perfil." });
  }

  // Validar la calificación
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "La calificación debe ser un número entre 1 y 5." });
  }

      try {
      // Registrar o actualizar la calificación del usuario para este perfil
      const upsertRatingQuery = `
          INSERT INTO profile_ratings (profile_id, user_id, rating)
          VALUES (@profileIdNum, @userId, @rating)
          ON CONFLICT (profile_id, user_id) DO UPDATE SET
              rating = EXCLUDED.rating,
              updated_at = CURRENT_TIMESTAMP
          RETURNING *;
      `;
      await db.query(upsertRatingQuery, { profileIdNum, userId, rating });
  
      // Actualizar las estadísticas de calificaciones en el perfil
      const updateProfileStatsQuery = `
        UPDATE perfiles_usuario
        SET average_rating = stats.avg_rating,
            total_ratings = stats.total_ratings
        FROM (
          SELECT profile_id, AVG(rating)::float AS avg_rating, COUNT(*) AS total_ratings
          FROM profile_ratings
          WHERE profile_id = @profileIdNum
          GROUP BY profile_id
        ) AS stats
        WHERE id_usuario = stats.profile_id;
      `;
      await db.query(updateProfileStatsQuery, { profileIdNum });
  
      const updatedProfileRatings = await db.query(
        `SELECT average_rating, total_ratings FROM perfiles_usuario WHERE id_usuario = @profileIdNum`,
        { profileIdNum }
      );

      if (updatedProfileRatings.rows.length === 0) {
        return res.status(404).json({ message: "Perfil no encontrado." });
      }
  
      res.status(200).json({
        message: "Perfil calificado exitosamente.",
        average_rating: updatedProfileRatings.rows[0].average_rating,
        total_ratings: updatedProfileRatings.rows[0].total_ratings,
        user_rating: rating,
      });
    } catch (error) {
      console.error("Error al calificar el perfil:", error);
      res.status(500).json({ message: "Error del servidor al calificar." });
    }
  });
module.exports = router;

// --- RUTA PROTEGIDA: ACTUALIZAR PERFIL DEL USUARIO AUTENTICADO ---
router.put(
  "/me",
  verificarToken,
  upload.single("foto_perfil"),
  async (req, res) => {
    const userId = req.user.id;
    const {
      nombre,
      apellido,
      telefono,
      nacionalidad,
      posicion_principal,
      resumen_profesional,
      cv_url,
      linkedin_url,
      instagram_url,
      youtube_url,
      transfermarkt_url,
      whatsapp_url,
      altura_cm,
      peso_kg,
      pie_dominante,
      fecha_de_nacimiento,
    } = req.body;

    let fotoPerfilUrl = null;

    try {
      const normalizedPosition = posicion_principal?.trim() || null;

      if (
        normalizedPosition &&
        !PROFILE_POSITION_OPTIONS.includes(normalizedPosition)
      ) {
        return res.status(400).json({
          message:
            "La posición principal debe ser Arquero, Defensa, Centrocampista o Delantero.",
        });
      }

      if (req.file) {
        const processedImageBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize(300, 300, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `user-photos/profile-${userId}-${Date.now()}.webp`;

        fotoPerfilUrl = await uploadToS3(
          processedImageBuffer,
          key,
          "image/webp"
        );
      }

      const upsertQuery = `
        INSERT INTO perfiles_usuario (id_usuario, foto_perfil_url, telefono, nacionalidad, resumen_profesional, cv_url, posicion_principal, linkedin_url, instagram_url, youtube_url, transfermarkt_url, whatsapp_url, altura_cm, peso_kg, pie_dominante, fecha_de_nacimiento)
        VALUES (@userId, @fotoPerfilUrl, @telefono, @nacionalidad, @resumen_profesional, @cv_url, @posicion_principal, @linkedin_url, @instagram_url, @youtube_url, @transfermarkt_url, @whatsapp_url, @altura_cm, @peso_kg, @pie_dominante, @fecha_de_nacimiento)
        ON CONFLICT (id_usuario)
        DO UPDATE SET
          foto_perfil_url = COALESCE(@fotoPerfilUrl, perfiles_usuario.foto_perfil_url),
          telefono = @telefono,
          nacionalidad = @nacionalidad,
          resumen_profesional = @resumen_profesional,
          cv_url = @cv_url,
          posicion_principal = @posicion_principal,
          linkedin_url = @linkedin_url,
          instagram_url = @instagram_url,
          youtube_url = @youtube_url,
          transfermarkt_url = @transfermarkt_url,
          whatsapp_url = @whatsapp_url,
          altura_cm = @altura_cm,
          peso_kg = @peso_kg,
          pie_dominante = @pie_dominante,
          fecha_de_nacimiento = @fecha_de_nacimiento
        RETURNING *;
      `;

      await db.query(upsertQuery, {
        userId,
        fotoPerfilUrl,
        telefono,
        nacionalidad,
        resumen_profesional,
        cv_url,
        posicion_principal: normalizedPosition,
        linkedin_url,
        instagram_url,
        youtube_url,
        transfermarkt_url,
        whatsapp_url,
        altura_cm: altura_cm || null,
        peso_kg: peso_kg || null,
        pie_dominante,
        fecha_de_nacimiento: fecha_de_nacimiento || null,
      });

      const result = await db.query(
        "SELECT * FROM usuarios WHERE id = @userId",
        { userId }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const updatedUser = result.rows[0];

      res.json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al actualizar el perfil." });
    }
  }
);

// --- RUTA PÚBLICA: OBTENER OFERTAS DE UN USUARIO ---
router.get("/:userId/offers", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    const query = `
      SELECT id, titulo, descripcion, estado, fecha_publicacion
      FROM ofertas_laborales
      WHERE id_usuario_ofertante = @userId
      ORDER BY fecha_publicacion DESC;
    `;
    const result = await db.query(query, { userId: parseInt(userId, 10) });
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las ofertas del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las ofertas." });
  }
});

// --- Esquema de validación para videos ---
const videoSchema = z.object({
  title: z.string().min(3).max(100),
  youtube_url: z
    .string()
    .url({ message: "Por favor, introduce una URL de YouTube válida." }),
  position: z.preprocess(
    (val) => parseInt(val, 10),
    z
      .number()
      .min(1, "La posición debe ser entre 1 y 5")
      .max(5, "La posición debe ser entre 1 y 5")
  ),
});

// --- RUTA PÚBLICA: OBTENER VIDEOS DE UN USUARIO ---
// Public route
router.get("/:userId/videos", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT id, user_id, title, youtube_url, cover_image_url, position
      FROM user_videos
      WHERE user_id = @userId
      ORDER BY position ASC;
    `;
    const result = await db.query(query, { userId });

    // Simplemente enviamos las filas directamente, ya que la URL de S3 es completa
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los videos del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener los videos." });
  }
});

// --- RUTA PROTEGIDA: AÑADIR UN NUEVO VIDEO ---
router.post(
  "/videos",
  verificarToken,
  upload.single("cover_image"),
  validate(videoSchema),
  async (req, res) => {
    const user_id = req.user.id;
    const { title, youtube_url, position } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "La imagen de portada es obligatoria." });
    }

    try {
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize(800, 450)
        .webp({ quality: 85 })
        .toBuffer();

      const key = `video-covers/cover-${user_id}-${Date.now()}.webp`;

      const coverImageUrl = await uploadToS3(
        processedImageBuffer,
        key,
        "image/webp"
      );

      const translatedTitles = await translateText(title, ["es", "en"]);

      const insertQuery = `
        INSERT INTO user_videos (user_id, title, title_es, title_en, youtube_url, cover_image_url, position)
        VALUES (@user_id, @title, @title_es, @title_en, @youtube_url, @cover_image_url, @position)
        RETURNING *;
      `;
      const result = await db.query(insertQuery, {
        user_id,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
        youtube_url,
        cover_image_url: coverImageUrl,
        position,
      });

      const newVideo = result.rows[0];

      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error al añadir el video:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al añadir el video." });
    }
  }
);

// ... (Otras rutas sin cambios)

// --- RUTA PÚBLICA: OBTENER FOTOS DE UN USUARIO ---
// --- RUTA PÚBLICA: OBTENER FOTOS DE UN USUARIO ---
router.get("/:userId/photos", async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT id, url, title, title_es, title_en
      FROM user_photos
      WHERE user_id = @userId
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, { userId });

    // Enviamos las filas directamente, la URL de la foto ya es la de S3.
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las fotos del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las fotos." });
  }
});

// --- RUTA PÚBLICA: OBTENER INFORMES DE SCOUTING DE UN USUARIO ---
router.get("/:userId/scouting-reports", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    const reportsResult = await db.query(
      `
        SELECT id, user_id, title, description, created_at, updated_at
        FROM scouting_reports
        WHERE user_id = @userId
        ORDER BY created_at DESC;
      `,
      { userId: parseInt(userId, 10) }
    );

    const reports = reportsResult.rows;

    if (reports.length === 0) {
      return res.json([]);
    }

    const imagesResult = await db.query(
      `
        SELECT id, report_id, url, position
        FROM scouting_report_images
        WHERE report_id = ANY(@reportIds::int[])
        ORDER BY report_id ASC, position ASC;
      `,
      { reportIds: reports.map((report) => report.id) }
    );

    const imagesByReport = imagesResult.rows.reduce((acc, image) => {
      acc[image.report_id] = acc[image.report_id] || [];
      acc[image.report_id].push(image);
      return acc;
    }, {});

    res.json(
      reports.map((report) => ({
        ...report,
        images: imagesByReport[report.id] || [],
      }))
    );
  } catch (error) {
    console.error("Error al obtener informes de scouting:", error);
    res.status(500).json({ message: "Error del servidor al obtener informes." });
  }
});

// --- RUTA PROTEGIDA: CREAR INFORME DE SCOUTING ---
router.post(
  "/:userId/scouting-reports",
  verificarToken,
  upload.array("images", MAX_SCOUTING_REPORT_IMAGES),
  async (req, res) => {
    const { userId } = req.params;
    const requester = req.user;
    const { title, description } = req.body;

    if (parseInt(userId, 10) !== requester.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para crear informes en este perfil." });
    }

    if (!title || title.trim().length < 3 || title.length > 150) {
      return res
        .status(400)
        .json({ message: "El título debe tener entre 3 y 150 caracteres." });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Debes subir al menos una imagen del informe." });
    }

    if (req.files.length > MAX_SCOUTING_REPORT_IMAGES) {
      return res
        .status(400)
        .json({ message: "Cada informe puede tener hasta 15 imágenes." });
    }

    let createdReportId = null;

    try {
      const countResult = await db.query(
        "SELECT COUNT(*)::int AS total FROM scouting_reports WHERE user_id = @userId",
        { userId: requester.id }
      );

      if (countResult.rows[0].total >= MAX_SCOUTING_REPORTS) {
        return res
          .status(400)
          .json({ message: "Solo puedes cargar hasta 3 informes de scouting." });
      }

      const reportResult = await db.query(
        `
          INSERT INTO scouting_reports (user_id, title, description)
          VALUES (@userId, @title, @description)
          RETURNING id, user_id, title, description, created_at, updated_at;
        `,
        {
          userId: requester.id,
          title: title.trim(),
          description: description?.trim() || null,
        }
      );

      const report = reportResult.rows[0];
      createdReportId = report.id;
      const uploadedImages = [];

      for (const [index, file] of req.files.entries()) {
        const processedImageBuffer = await sharp(file.buffer)
          .rotate()
          .resize(1600, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();

        const key = `scouting-reports/report-${report.id}-${index + 1}-${Date.now()}.webp`;
        const imageUrl = await uploadToS3(processedImageBuffer, key, "image/webp");

        const imageResult = await db.query(
          `
            INSERT INTO scouting_report_images (report_id, url, position)
            VALUES (@reportId, @url, @position)
            RETURNING id, report_id, url, position;
          `,
          {
            reportId: report.id,
            url: imageUrl,
            position: index + 1,
          }
        );

        uploadedImages.push(imageResult.rows[0]);
      }

      res.status(201).json({ ...report, images: uploadedImages });
    } catch (error) {
      console.error("Error al crear informe de scouting:", error);
      if (createdReportId) {
        try {
          await db.query("DELETE FROM scouting_reports WHERE id = @reportId", {
            reportId: createdReportId,
          });
        } catch (cleanupError) {
          console.error("Error al limpiar informe de scouting incompleto:", cleanupError);
        }
      }
      res.status(500).json({ message: "Error del servidor al crear informe." });
    }
  }
);

// --- RUTA PROTEGIDA: ELIMINAR INFORME DE SCOUTING ---
router.delete("/:userId/scouting-reports/:reportId", verificarToken, async (req, res) => {
  const { userId, reportId } = req.params;
  const requester = req.user;

  if (parseInt(userId, 10) !== requester.id) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para eliminar informes de este perfil." });
  }

  try {
    const result = await db.query(
      `
        DELETE FROM scouting_reports
        WHERE id = @reportId AND user_id = @userId
        RETURNING id;
      `,
      { reportId, userId: requester.id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Informe no encontrado." });
    }

    res.json({ message: "Informe eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar informe de scouting:", error);
    res.status(500).json({ message: "Error del servidor al eliminar informe." });
  }
});

// --- RUTA PROTEGIDA: SUBIR UNA FOTO ---
router.post(
  "/:userId/photos",
  verificarToken,
  upload.single("photo"),
  async (req, res) => {
    const { userId } = req.params;
    const { title } = req.body;
    const requester = req.user;

    if (isNaN(parseInt(userId, 10))) {
      return res
        .status(400)
        .json({ message: "El ID de usuario debe ser un número." });
    }

    if (parseInt(userId, 10) !== requester.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para subir fotos a este perfil." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo." });
    }

    try {
      const processedImageBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize(1024)
        .webp({ quality: 80 })
        .toBuffer();

      const key = `user-photos/photo-${userId}-${Date.now()}.webp`;

      const photoUrl = await uploadToS3(
        processedImageBuffer,
        key,
        "image/webp"
      );

      const translatedTitles = await translateText(title);

      const insertQuery = `
        INSERT INTO user_photos (user_id, url, title, title_es, title_en)
        VALUES (@userId, @url, @title, @title_es, @title_en)
        RETURNING *;
      `;
      const result = await db.query(insertQuery, {
        userId,
        url: photoUrl,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
      });

      const newPhoto = result.rows[0];

      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error al subir la foto:", error);
      res.status(500).json({ message: "Error del servidor al subir la foto." });
    }
  }
);

// ... (El resto de las rutas como DELETE)

// --- RUTA PROTEGIDA: ELIMINAR UNA FOTO ---
router.delete("/:userId/photos/:photoId", verificarToken, async (req, res) => {
  const { userId, photoId } = req.params;
  const requester = req.user;

  if (parseInt(userId, 10) !== requester.id) {
    return res.status(403).json({
      message: "No tienes permiso para eliminar fotos de este perfil.",
    });
  }

  try {
    // Opcional: verificar que la foto existe y pertenece al usuario
    const photoResult = await db.query(
      "SELECT * FROM user_photos WHERE id = @photoId AND user_id = @userId",
      { photoId, userId }
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada." });
    }

    // Eliminar archivo del sistema de archivos
    const filename = photoResult.rows[0].url;
    const filePath = path.resolve(__dirname, "..", "uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar de la base de datos
    await db.query("DELETE FROM user_photos WHERE id = @photoId", { photoId });

    res.json({ message: "Foto eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar la foto:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar la foto." });
  }
});

// --- RUTA PROTEGIDA: ACTUALIZAR UN VIDEO ---
router.put(
  "/videos/:videoId",
  verificarToken,
  upload.single("cover_image"),
  validate(videoSchema.partial()), // Permite actualizaciones parciales
  async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { title, youtube_url, position } = req.body;

    try {
      // Verificar que el video pertenece al usuario
      const videoResult = await db.query(
        "SELECT * FROM user_videos WHERE id = @videoId AND user_id = @userId",
        { videoId, userId }
      );

      if (videoResult.rows.length === 0) {
        return res.status(404).json({
          message: "Video no encontrado o no tienes permiso para editarlo.",
        });
      }

      let coverImageFilename = videoResult.rows[0].cover_image_url;

      if (req.file) {
        const processedImageBuffer = await sharp(req.file.buffer)
          .resize(800, 450)
          .webp({ quality: 85 })
          .toBuffer();

        const key = `video-covers/cover-${userId}-${Date.now()}.webp`;

        const newCoverImageUrl = await uploadToS3(
          processedImageBuffer,
          key,
          "image/webp"
        );

        // Eliminar la imagen de portada anterior si existe
        if (coverImageFilename) {
          // TODO: Implementar la eliminación de la imagen anterior de S3
        }
        coverImageFilename = newCoverImageUrl;
      }

      const translatedTitles = await translateText(title, ["es", "en"]);

      const updateQuery = `
        UPDATE user_videos
        SET 
          title = @title,
          title_es = @title_es,
          title_en = @title_en,
          youtube_url = @youtube_url,
          position = @position,
          cover_image_url = @coverImageFilename
        WHERE id = @videoId
        RETURNING *;
      `;

      const result = await db.query(updateQuery, {
        videoId,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
        youtube_url,
        position,
        coverImageFilename,
      });

      const updatedVideo = result.rows[0];

      res.json(updatedVideo);
    } catch (error) {
      console.error("Error al actualizar el video:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al actualizar el video." });
    }
  }
);

// --- RUTA PROTEGIDA: ELIMINAR UN VIDEO ---
router.delete("/videos/:videoId", verificarToken, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  try {
    // Verificar que el video pertenece al usuario
    const videoResult = await db.query(
      "SELECT * FROM user_videos WHERE id = @videoId AND user_id = @userId",
      { videoId, userId }
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Video no encontrado o no tienes permiso para eliminarlo.",
      });
    }

    // Eliminar la imagen de portada del sistema de archivos
    const coverImageFilename = videoResult.rows[0].cover_image_url;
    if (coverImageFilename) {
      const filePath = path.resolve(
        __dirname,
        "..",
        "uploads",
        coverImageFilename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar de la base de datos
    await db.query("DELETE FROM user_videos WHERE id = @videoId", { videoId });

    res.json({ message: "Video eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el video:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar el video." });
  }
});

module.exports = router;
