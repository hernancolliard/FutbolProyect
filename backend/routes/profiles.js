const express = require("express");
const router = express.Router();
const db = require("../db");
const { verificarToken, popularRolUsuario } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { z } = require("zod");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { translateText } = require("../services/translationService");
const fs = require("fs");

// Helper para construir la URL completa
const getFullUrl = (req, filePath) => {
  return `${req.protocol}://${req.get("host")}/${filePath}`;
};

// --- RUTA PÚBLICA: OBTENER OFERTAS DE UN USUARIO ---
router.get("/:userId/offers", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "El ID de usuario debe ser un número." });
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

// Configuración de Multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- RUTA PÚBLICA: OBTENER VIDEOS DE UN USUARIO ---
router.get("/:userId/videos", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    const query = `
      SELECT id, user_id, title, youtube_url, cover_image_url, position
      FROM user_videos
      WHERE user_id = @userId
      ORDER BY position ASC;
    `;
    const result = await db.query(query, { userId });

    const videosWithFullUrls = result.rows.map((video) => ({
      ...video,
      cover_image_url: video.cover_image_url
        ? getFullUrl(req, `uploads/${video.cover_image_url}`)
        : null,
    }));

    res.json(videosWithFullUrls);
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
      const uploadsDir = path.resolve(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const coverImageFilename = `cover-${user_id}-${Date.now()}.webp`;
      const outputPath = path.join(uploadsDir, coverImageFilename);

      await sharp(req.file.buffer)
        .resize(800, 450)
        .webp({ quality: 85 })
        .toFile(outputPath);

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
        cover_image_url: coverImageFilename,
        position,
      });

      const newVideo = result.rows[0];
      newVideo.cover_image_url = getFullUrl(req, `uploads/${newVideo.cover_image_url}`);

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

    const photosWithFullUrls = result.rows.map((photo) => ({
      ...photo,
      url: getFullUrl(req, `uploads/${photo.url}`),
    }));

    res.json(photosWithFullUrls);
  } catch (error) {
    console.error("Error al obtener las fotos del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las fotos." });
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
      return res.status(400).json({ message: "El ID de usuario debe ser un número." });
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
      const uploadsDir = path.resolve(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const photoFilename = `user-photo-${userId}-${Date.now()}.webp`;
      const outputPath = path.join(uploadsDir, photoFilename);

      await sharp(req.file.buffer)
        .rotate()
        .resize(1024)
        .webp({ quality: 80 })
        .toFile(outputPath);

      const translatedTitles = await translateText(title);

      const insertQuery = `
        INSERT INTO user_photos (user_id, url, title, title_es, title_en)
        VALUES (@userId, @url, @title, @title_es, @title_en)
        RETURNING *;
      `;
      const result = await db.query(insertQuery, {
        userId,
        url: photoFilename,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
      });

      const newPhoto = result.rows[0];
      newPhoto.url = getFullUrl(req, `uploads/${newPhoto.url}`);

      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error al subir la foto:", error);
      res.status(500).json({ message: "Error del servidor al subir la foto." });
    }
  }
);

// ... (El resto de las rutas como DELETE)

module.exports = router;
